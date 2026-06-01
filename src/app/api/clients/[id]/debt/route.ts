import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

/**
 * POST /api/clients/[id]/debt
 * Records a new debt/service charge for a client using double-entry accounting:
 *   DEBIT  Accounts Receivable (1100)  — client owes us more
 *   CREDIT Service Revenue      (4000)  — we earned revenue
 * Also updates client.priceQuoted for the UI balance display.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { amount, description } = await req.json()

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Resolve account IDs
    const [{ data: arAccount }, { data: revenueAccount }] = await Promise.all([
      supabase.from('accounts').select('id').eq('account_number', '1100').single(),
      supabase.from('accounts').select('id').eq('account_number', '4000').single(),
    ])

    // 1. Create journal entry (double-entry)
    if (arAccount && revenueAccount) {
      const entryId = crypto.randomUUID()
      const { error: entryErr } = await supabase.from('journal_entries').insert({
        id: entryId,
        date: new Date().toISOString(),
        description: description || `Service charge for client ${id}`,
        reference_id: id,
        reference_type: 'debt',
      })
      if (entryErr) {
        console.error('[Debt] Journal entry error:', entryErr)
        return NextResponse.json({ error: entryErr.message }, { status: 500 })
      }

      const { error: itemsErr } = await supabase.from('journal_items').insert([
        { id: crypto.randomUUID(), journal_entry_id: entryId, account_id: arAccount.id,      debit: Number(amount), credit: 0 },
        { id: crypto.randomUUID(), journal_entry_id: entryId, account_id: revenueAccount.id, debit: 0,             credit: Number(amount) },
      ])
      if (itemsErr) {
        console.error('[Debt] Journal items error:', itemsErr)
        return NextResponse.json({ error: itemsErr.message }, { status: 500 })
      }
    }

    // 2. Legacy payment record for history timeline (negative = debt marker)
    await supabase.from('Payment').insert({
      id: crypto.randomUUID(),
      clientId: id,
      amount: -Math.abs(Number(amount)),
      date: new Date().toISOString(),
    })

    // 3. Update client.priceQuoted so UI balance stays in sync
    const { data: client } = await supabase
      .from('Client').select('priceQuoted').eq('id', id).single()
    const newTotal = (Number(client?.priceQuoted) || 0) + Math.abs(Number(amount))

    const { error: updateErr } = await supabase
      .from('Client')
      .update({ priceQuoted: newTotal, updatedAt: new Date().toISOString() })
      .eq('id', id)
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    return NextResponse.json({ success: true, newTotal })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
