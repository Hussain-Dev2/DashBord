import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

/**
 * POST /api/clients/[id]/payment
 * Records a client payment using double-entry accounting:
 *   DEBIT  Cash (1000)                  — we received money
 *   CREDIT Accounts Receivable (1100)   — client owes us less
 * Also updates client.amountPaid for the UI balance display.
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
    const [{ data: cashAccount }, { data: arAccount }] = await Promise.all([
      supabase.from('accounts').select('id').eq('account_number', '1000').single(),
      supabase.from('accounts').select('id').eq('account_number', '1100').single(),
    ])

    // 1. Create journal entry (double-entry)
    if (cashAccount && arAccount) {
      const entryId = crypto.randomUUID()
      const { error: entryErr } = await supabase.from('journal_entries').insert({
        id: entryId,
        date: new Date().toISOString(),
        description: description || `Payment received from client ${id}`,
        reference_id: id,
        reference_type: 'payment',
      })
      if (entryErr) {
        console.error('[Payment] Journal entry error:', entryErr)
        return NextResponse.json({ error: entryErr.message }, { status: 500 })
      }

      const { error: itemsErr } = await supabase.from('journal_items').insert([
        { id: crypto.randomUUID(), journal_entry_id: entryId, account_id: cashAccount.id, debit: Number(amount), credit: 0 },
        { id: crypto.randomUUID(), journal_entry_id: entryId, account_id: arAccount.id,   debit: 0,             credit: Number(amount) },
      ])
      if (itemsErr) {
        console.error('[Payment] Journal items error:', itemsErr)
        return NextResponse.json({ error: itemsErr.message }, { status: 500 })
      }
    }

    // 2. Legacy payment record for history timeline
    await supabase.from('Payment').insert({
      id: crypto.randomUUID(),
      clientId: id,
      amount: Number(amount),
      date: new Date().toISOString(),
    })

    // 3. Update client.amountPaid so UI balance stays in sync
    const { data: client } = await supabase
      .from('Client').select('amountPaid').eq('id', id).single()
    const newAmount = (Number(client?.amountPaid) || 0) + Number(amount)

    const { error: updateErr } = await supabase
      .from('Client')
      .update({ amountPaid: newAmount, updatedAt: new Date().toISOString() })
      .eq('id', id)
    if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 })

    return NextResponse.json({ success: true, newAmount })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
