import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import type { PLStatement, BalanceSheet } from '@/lib/types'

/**
 * GET /api/accounting/reports
 * Query params:
 *   type=pl|balance  (required)
 *   from=ISO date    (for P&L)
 *   to=ISO date      (for P&L)
 *   asOf=ISO date    (for Balance Sheet, defaults to now)
 */
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const reportType = searchParams.get('type')
  const supabase = createAdminClient()

  try {
    // ── Fetch all accounts ──────────────────────────────────
    const { data: accounts, error: accErr } = await supabase
      .from('accounts')
      .select('*')
      .order('account_number')
    if (accErr) return NextResponse.json({ error: accErr.message }, { status: 500 })

    // ── Fetch all journal items (with entry metadata) ───────
    let itemsQuery = supabase
      .from('journal_items')
      .select('*, entry:journal_entries(date, reference_type)')

    const from  = searchParams.get('from')
    const to    = searchParams.get('to')
    const asOf  = searchParams.get('asOf')

    // For P&L: filter by date range
    if (reportType === 'pl') {
      if (from) itemsQuery = itemsQuery.gte('entry.date', from)
      if (to)   itemsQuery = itemsQuery.lte('entry.date', to)
    }
    // For Balance Sheet: up to asOf date
    if (reportType === 'balance' && asOf) {
      itemsQuery = itemsQuery.lte('entry.date', asOf)
    }

    const { data: items, error: itemsErr } = await itemsQuery
    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })

    // ── Build account balance map ────────────────────────────
    // For each account: net = debit - credit (for Asset/Expense)
    //                   net = credit - debit (for Liability/Equity/Revenue)
    const balanceMap = new Map<string, number>()
    for (const account of accounts) {
      balanceMap.set(account.id, 0)
    }

    for (const item of items ?? []) {
      const acc = accounts.find(a => a.id === item.account_id)
      if (!acc) continue
      const prev = balanceMap.get(acc.id) ?? 0
      const isDebitNormal = acc.type === 'Asset' || acc.type === 'Expense'
      const delta = isDebitNormal
        ? (Number(item.debit) - Number(item.credit))
        : (Number(item.credit) - Number(item.debit))
      balanceMap.set(acc.id, prev + delta)
    }

    // ── P&L Report ───────────────────────────────────────────
    if (reportType === 'pl') {
      const revenueAccounts  = accounts.filter(a => a.type === 'Revenue')
      const expenseAccounts  = accounts.filter(a => a.type === 'Expense')

      const revenueByAccount = revenueAccounts
        .map(a => ({ account: a, total: balanceMap.get(a.id) ?? 0 }))
        .filter(r => r.total !== 0)

      const expensesByAccount = expenseAccounts
        .map(a => ({ account: a, total: balanceMap.get(a.id) ?? 0 }))
        .filter(r => r.total !== 0)

      const totalRevenue  = revenueByAccount.reduce((s, r) => s + r.total, 0)
      const totalExpenses = expensesByAccount.reduce((s, r) => s + r.total, 0)

      const pl: PLStatement = {
        dateFrom: from || '',
        dateTo: to || new Date().toISOString(),
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        revenueByAccount,
        expensesByAccount,
      }
      return NextResponse.json(pl)
    }

    // ── Balance Sheet ────────────────────────────────────────
    if (reportType === 'balance') {
      const byAccount = accounts
        .map(a => ({ account: a, balance: balanceMap.get(a.id) ?? 0 }))

      const totalAssets      = byAccount.filter(r => r.account.type === 'Asset').reduce((s, r) => s + r.balance, 0)
      const totalLiabilities = byAccount.filter(r => r.account.type === 'Liability').reduce((s, r) => s + r.balance, 0)
      const totalEquity      = byAccount.filter(r => r.account.type === 'Equity').reduce((s, r) => s + r.balance, 0)

      const bs: BalanceSheet = {
        asOf: asOf || new Date().toISOString(),
        totalAssets,
        totalLiabilities,
        totalEquity,
        isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
        byAccount,
      }
      return NextResponse.json(bs)
    }

    return NextResponse.json({ error: 'Invalid report type. Use ?type=pl or ?type=balance' }, { status: 400 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Server error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
