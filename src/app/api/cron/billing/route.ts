import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

/**
 * POST /api/cron/billing
 *
 * Called daily by Vercel Cron (see vercel.json).
 * Secured by a CRON_SECRET env variable — Vercel sends it as Authorization header.
 *
 * Logic:
 *  1. Find all active subscriptions where next_billing_date <= now()
 *  2. For each: create a new revenue journal entry (DR AR / CR Subscription Revenue)
 *  3. Advance next_billing_date by one period
 *  4. Return a summary of processed subscriptions
 */
export async function POST(req: NextRequest) {
  // Verify Vercel Cron secret
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date().toISOString()
  const processed: string[] = []
  const failed: { id: string; error: string }[] = []

  try {
    // 1. Fetch due subscriptions
    const { data: dueSubscriptions, error: fetchErr } = await supabase
      .from('subscriptions')
      .select('*, product:products(name)')
      .eq('status', 'active')
      .not('next_billing_date', 'is', null)
      .lte('next_billing_date', now)

    if (fetchErr) {
      return NextResponse.json({ error: fetchErr.message }, { status: 500 })
    }

    if (!dueSubscriptions || dueSubscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscriptions due', processed: 0 })
    }

    // Look up key account IDs
    const { data: arAccount }  = await supabase.from('accounts').select('id').eq('account_number', '1100').single()
    const { data: revAccount } = await supabase.from('accounts').select('id').eq('account_number', '4100').single()

    for (const sub of dueSubscriptions) {
      try {
        const productName = sub.product?.name || 'Subscription'

        // 2. Create journal entry for this billing cycle
        if (arAccount && revAccount) {
          const entryId = crypto.randomUUID()
          await supabase.from('journal_entries').insert({
            id: entryId,
            date: now,
            description: `Auto-billing: ${productName} (${sub.billing_cycle}) for client ${sub.client_id}`,
            reference_id: sub.id,
            reference_type: 'subscription',
          })
          await supabase.from('journal_items').insert([
            { id: crypto.randomUUID(), journal_entry_id: entryId, account_id: arAccount.id,  debit: sub.price, credit: 0 },
            { id: crypto.randomUUID(), journal_entry_id: entryId, account_id: revAccount.id, debit: 0, credit: sub.price },
          ])
        }

        // 3. Advance next_billing_date
        const currentDate = new Date(sub.next_billing_date)
        let nextDate: Date

        if (sub.billing_cycle === 'monthly') {
          nextDate = new Date(currentDate)
          nextDate.setMonth(nextDate.getMonth() + 1)
        } else if (sub.billing_cycle === 'yearly') {
          nextDate = new Date(currentDate)
          nextDate.setFullYear(nextDate.getFullYear() + 1)
        } else {
          // one_time: mark as completed, no next date
          await supabase
            .from('subscriptions')
            .update({ status: 'past_due', next_billing_date: null })
            .eq('id', sub.id)
          processed.push(sub.id)
          continue
        }

        await supabase
          .from('subscriptions')
          .update({ next_billing_date: nextDate.toISOString() })
          .eq('id', sub.id)

        // 4. Also update client amountPaid (keep the existing balance in sync)
        const { data: client } = await supabase
          .from('Client').select('amountPaid').eq('id', sub.client_id).single()
        if (client) {
          await supabase
            .from('Client')
            .update({ amountPaid: Number(client.amountPaid) + Number(sub.price), updatedAt: now })
            .eq('id', sub.client_id)
        }

        processed.push(sub.id)
      } catch (subErr: unknown) {
        const msg = subErr instanceof Error ? subErr.message : 'Unknown error'
        failed.push({ id: sub.id, error: msg })
      }
    }

    return NextResponse.json({
      message: `Billing complete`,
      processed: processed.length,
      failed: failed.length,
      processedIds: processed,
      failedItems: failed,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
