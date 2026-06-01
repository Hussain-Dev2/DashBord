import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

// GET /api/subscriptions — list subscriptions (optionally filter by client_id)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const clientId = searchParams.get('client_id')

    const supabase = createAdminClient()
    let query = supabase
      .from('subscriptions')
      .select('*, product:products(*)')
      .order('created_at', { ascending: false })

    if (clientId) query = query.eq('client_id', clientId)

    const { data, error } = await query
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json(data)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// POST /api/subscriptions — create a new subscription
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { client_id, billing_cycle, price, product_id, start_date } = body

    if (!client_id || !billing_cycle || price === undefined) {
      return NextResponse.json(
        { error: 'client_id, billing_cycle, and price are required' },
        { status: 400 }
      )
    }

    // Calculate next billing date
    const startDate = start_date ? new Date(start_date) : new Date()
    let nextBillingDate: Date | null = null

    if (billing_cycle === 'monthly') {
      nextBillingDate = new Date(startDate)
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1)
    } else if (billing_cycle === 'yearly') {
      nextBillingDate = new Date(startDate)
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1)
    }
    // one_time: no next billing date

    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('subscriptions')
      .insert({
        id: crypto.randomUUID(),
        client_id,
        billing_cycle,
        price: Number(price),
        product_id: product_id || null,
        status: 'active',
        start_date: startDate.toISOString(),
        next_billing_date: nextBillingDate?.toISOString() || null,
      })
      .select('*, product:products(*)')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Also create the initial revenue journal entry for the first billing
    const supabase2 = createAdminClient()
    const { data: arAccount } = await supabase2
      .from('accounts').select('id').eq('account_number', '1100').single()
    const { data: revenueAccount } = await supabase2
      .from('accounts').select('id')
      .eq('account_number', billing_cycle === 'one_time' ? '4000' : '4100')
      .single()

    if (arAccount && revenueAccount) {
      const entryId = crypto.randomUUID()
      await supabase2.from('journal_entries').insert({
        id: entryId,
        date: startDate.toISOString(),
        description: `Subscription created — ${billing_cycle} @ $${price}`,
        reference_id: data.id,
        reference_type: 'subscription',
      })
      await supabase2.from('journal_items').insert([
        { id: crypto.randomUUID(), journal_entry_id: entryId, account_id: arAccount.id,      debit: Number(price), credit: 0 },
        { id: crypto.randomUUID(), journal_entry_id: entryId, account_id: revenueAccount.id, debit: 0, credit: Number(price) },
      ])
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
