import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

// GET /api/accounting/journal — fetch journal entries (with optional date filters)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to   = searchParams.get('to')
    const refId = searchParams.get('reference_id')

    const supabase = createAdminClient()
    let query = supabase
      .from('journal_entries')
      .select('*, items:journal_items(*, account:accounts(*))')
      .order('date', { ascending: false })

    if (from) query = query.gte('date', from)
    if (to)   query = query.lte('date', to)
    if (refId) query = query.eq('reference_id', refId)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/accounting/journal — create a balanced journal entry
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { description, date, reference_id, reference_type, items } = body

    if (!description || !items || !Array.isArray(items) || items.length < 2) {
      return NextResponse.json(
        { error: 'description and at least 2 items are required' },
        { status: 400 }
      )
    }

    // Validate balance before hitting DB
    const totalDebit  = items.reduce((s: number, i: { debit?: number }) => s + (Number(i.debit)  || 0), 0)
    const totalCredit = items.reduce((s: number, i: { credit?: number }) => s + (Number(i.credit) || 0), 0)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        { error: `Unbalanced entry: debits (${totalDebit}) ≠ credits (${totalCredit})` },
        { status: 422 }
      )
    }

    const supabase = createAdminClient()
    const entryId = crypto.randomUUID()

    // Insert header
    const { error: entryError } = await supabase
      .from('journal_entries')
      .insert({
        id: entryId,
        date: date || new Date().toISOString(),
        description,
        reference_id: reference_id || null,
        reference_type: reference_type || null,
      })
    if (entryError) return NextResponse.json({ error: entryError.message }, { status: 500 })

    // Insert line items
    const lineItems = items.map((item: { account_id: string; debit?: number; credit?: number }) => ({
      id: crypto.randomUUID(),
      journal_entry_id: entryId,
      account_id: item.account_id,
      debit: Number(item.debit) || 0,
      credit: Number(item.credit) || 0,
    }))

    const { error: itemsError } = await supabase.from('journal_items').insert(lineItems)
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

    return NextResponse.json({ id: entryId, success: true }, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
