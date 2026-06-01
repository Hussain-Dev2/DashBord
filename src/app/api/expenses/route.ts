import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

// GET /api/expenses — list all expenses
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const from = searchParams.get('from')
    const to   = searchParams.get('to')

    const supabase = createAdminClient()
    let query = supabase
      .from('expenses')
      .select('*, account:accounts(id, account_number, name, type)')
      .order('date', { ascending: false })

    if (from) query = query.gte('date', from)
    if (to)   query = query.lte('date', to)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/expenses — record a new expense + matching journal entry
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { category_account_id, amount, payment_method, date, description, receipt_url } = body

    if (!category_account_id || !amount || !payment_method) {
      return NextResponse.json(
        { error: 'category_account_id, amount, and payment_method are required' },
        { status: 400 }
      )
    }

    if (Number(amount) <= 0) {
      return NextResponse.json({ error: 'Amount must be positive' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Look up Cash account (1000) for the debit side
    const { data: cashAccount } = await supabase
      .from('accounts')
      .select('id')
      .eq('account_number', '1000')
      .single()

    const cashAccountId = cashAccount?.id

    // 1. Create journal entry
    //    Debit: Expense account  (increases expense)
    //    Credit: Cash/Bank       (decreases asset)
    const entryId = crypto.randomUUID()
    const { error: entryErr } = await supabase
      .from('journal_entries')
      .insert({
        id: entryId,
        date: date || new Date().toISOString(),
        description: description || `Expense: ${payment_method}`,
        reference_type: 'expense',
      })
    if (entryErr) return NextResponse.json({ error: entryErr.message }, { status: 500 })

    const lineItems = [
      { id: crypto.randomUUID(), journal_entry_id: entryId, account_id: category_account_id, debit: Number(amount), credit: 0 },
      // Credit Cash if we have the account, otherwise skip (still record expense)
      ...(cashAccountId ? [
        { id: crypto.randomUUID(), journal_entry_id: entryId, account_id: cashAccountId, debit: 0, credit: Number(amount) }
      ] : [])
    ]

    if (cashAccountId) {
      const { error: itemsErr } = await supabase.from('journal_items').insert(lineItems)
      if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })
    }

    // 2. Insert expense record
    const expenseId = crypto.randomUUID()
    const { data, error: expErr } = await supabase
      .from('expenses')
      .insert({
        id: expenseId,
        category_account_id,
        amount: Number(amount),
        payment_method,
        date: date || new Date().toISOString(),
        description: description || null,
        receipt_url: receipt_url || null,
        journal_entry_id: entryId,
      })
      .select('*, account:accounts(id, account_number, name, type)')
      .single()

    if (expErr) return NextResponse.json({ error: expErr.message }, { status: 500 })

    return NextResponse.json(data, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
