'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, TrendingUp, TrendingDown, Scale,
  DollarSign, BarChart2, PieChart, Calendar,
  CheckCircle2, AlertTriangle, RefreshCw, Layers
} from 'lucide-react'
import { usePLStatement, useBalanceSheet } from '@/hooks/useAccounting'
import { useCurrency } from '@/contexts/CurrencyContext'

// ── Date Range Presets ──────────────────────────────────────
type Preset = 'month' | 'quarter' | 'year' | 'custom'

function getDateRange(preset: Preset, custom?: { from: string; to: string }) {
  const now = new Date()
  const to = new Date(now)
  to.setHours(23, 59, 59, 999)

  switch (preset) {
    case 'month': {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: from.toISOString(), to: to.toISOString() }
    }
    case 'quarter': {
      const quarter = Math.floor(now.getMonth() / 3)
      const from = new Date(now.getFullYear(), quarter * 3, 1)
      return { from: from.toISOString(), to: to.toISOString() }
    }
    case 'year': {
      const from = new Date(now.getFullYear(), 0, 1)
      return { from: from.toISOString(), to: to.toISOString() }
    }
    case 'custom':
      return { from: custom?.from || '', to: custom?.to || '' }
    default:
      return { from: '', to: '' }
  }
}

// ── Mini Bar Chart ─────────────────────────────────────────
function MiniBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div className="flex items-center gap-3 group">
      <span className="text-xs text-gray-500 w-36 truncate shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <span className="text-xs font-bold text-white w-20 text-right shrink-0">
        ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  )
}

// ── Stat Tile ──────────────────────────────────────────────
function StatTile({
  label, value, sub, icon: Icon, positive, className = ''
}: {
  label: string; value: string; sub?: string
  icon: React.ElementType; positive?: boolean; className?: string
}) {
  return (
    <div className={`rounded-2xl border border-white/8 bg-white/[0.02] p-5 flex flex-col gap-3 ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</span>
        <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${
          positive === true  ? 'bg-emerald-500/10' :
          positive === false ? 'bg-red-500/10' :
          'bg-amber-500/10'
        }`}>
          <Icon className={`h-4 w-4 ${
            positive === true  ? 'text-emerald-400' :
            positive === false ? 'text-red-400' :
            'text-amber-400'
          }`} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-black text-white tracking-tight">{value}</p>
        {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────
export default function AdminAnalyticsPage() {
  const { formatAmount } = useCurrency()
  const [preset, setPreset]   = useState<Preset>('month')
  const [customFrom, setFrom] = useState('')
  const [customTo, setTo]     = useState('')

  const dateRange = useMemo(
    () => getDateRange(preset, { from: customFrom, to: customTo }),
    [preset, customFrom, customTo]
  )

  const { data: pl,  isLoading: plLoading,  refetch: refetchPL  } = usePLStatement(dateRange.from, dateRange.to)
  const { data: bs,  isLoading: bsLoading,  refetch: refetchBS  } = useBalanceSheet()
  const isLoading = plLoading || bsLoading

  const maxRevenue = Math.max(...(pl?.revenueByAccount?.map(r => r.total) || [1]))
  const maxExpense = Math.max(...(pl?.expensesByAccount?.map(r => r.total) || [1]))

  const presets: { key: Preset; label: string }[] = [
    { key: 'month',   label: 'This Month'   },
    { key: 'quarter', label: 'This Quarter' },
    { key: 'year',    label: 'This Year'    },
    { key: 'custom',  label: 'Custom'       },
  ]

  return (
    <div
      className="min-h-screen text-white pb-12"
      style={{ background: 'linear-gradient(160deg, #0d0f1a 0%, #111327 60%, #0d0f1a 100%)' }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[500px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/8 bg-slate-900/60 px-4 md:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <div className="h-4 w-px bg-white/10" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                <BarChart2 className="h-4 w-4 text-amber-400" />
              </div>
              <h1 className="text-base font-bold text-white">Financial Reports</h1>
            </div>
          </div>
          <button
            onClick={() => { refetchPL(); refetchBS() }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 md:px-8 pt-6 relative z-10 space-y-6">

        {/* Date Range Selector */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/8">
            {presets.map(p => (
              <button
                key={p.key}
                onClick={() => setPreset(p.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  preset === p.key
                    ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {preset === 'custom' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                <input
                  type="date"
                  value={customFrom}
                  onChange={e => setFrom(e.target.value)}
                  className="bg-transparent text-xs text-white outline-none"
                />
              </div>
              <span className="text-gray-600 text-xs">to</span>
              <div className="flex items-center gap-1.5 bg-white/[0.03] border border-white/8 rounded-xl px-3 py-1.5">
                <Calendar className="h-3.5 w-3.5 text-gray-500" />
                <input
                  type="date"
                  value={customTo}
                  onChange={e => setTo(e.target.value)}
                  className="bg-transparent text-xs text-white outline-none"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── P&L Section ──────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-4 w-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Profit & Loss Statement</h2>
          </div>

          {plLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-28 rounded-2xl bg-white/[0.02] border border-white/8 animate-pulse" />
              ))}
            </div>
          ) : pl ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <StatTile
                  label="Total Revenue"
                  value={formatAmount(pl.totalRevenue)}
                  sub={`${pl.revenueByAccount?.length ?? 0} revenue accounts`}
                  icon={TrendingUp}
                  positive
                />
                <StatTile
                  label="Total Expenses"
                  value={formatAmount(pl.totalExpenses)}
                  sub={`${pl.expensesByAccount?.length ?? 0} expense accounts`}
                  icon={TrendingDown}
                  positive={false}
                />
                <StatTile
                  label="Net Profit"
                  value={formatAmount(pl.netProfit)}
                  sub={pl.netProfit >= 0 ? 'Profitable period' : 'Operating at a loss'}
                  icon={DollarSign}
                  positive={pl.netProfit >= 0}
                  className={pl.netProfit >= 0 ? 'border-emerald-500/20' : 'border-red-500/20'}
                />
              </div>

              {/* Revenue breakdown */}
              {pl.revenueByAccount && pl.revenueByAccount.length > 0 && (
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 mb-3">
                  <p className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-4">Revenue Breakdown</p>
                  <div className="space-y-3">
                    {pl.revenueByAccount.map(r => (
                      <MiniBar
                        key={r.account.id}
                        label={r.account.name}
                        value={r.total}
                        max={maxRevenue}
                        color="linear-gradient(90deg, #10b981, #34d399)"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Expense breakdown */}
              {pl.expensesByAccount && pl.expensesByAccount.length > 0 && (
                <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                  <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-4">Expense Breakdown</p>
                  <div className="space-y-3">
                    {pl.expensesByAccount.map(r => (
                      <MiniBar
                        key={r.account.id}
                        label={r.account.name}
                        value={r.total}
                        max={maxExpense}
                        color="linear-gradient(90deg, #ef4444, #f87171)"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* No data state */}
              {(!pl.revenueByAccount?.length && !pl.expensesByAccount?.length) && (
                <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center">
                  <Layers className="h-10 w-10 text-gray-700 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No journal entries found for this period.</p>
                  <p className="text-gray-700 text-xs mt-1">Record debts and payments to populate this report.</p>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* ── Balance Sheet ─────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Scale className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-widest">Balance Sheet</h2>
            {bs && (
              <span className={`ml-auto flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg ${
                bs.isBalanced
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
              }`}>
                {bs.isBalanced ? <CheckCircle2 className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                {bs.isBalanced ? 'Balanced' : 'Unbalanced'}
              </span>
            )}
          </div>

          {bsLoading ? (
            <div className="h-40 rounded-2xl bg-white/[0.02] border border-white/8 animate-pulse" />
          ) : bs ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <StatTile
                label="Total Assets"
                value={formatAmount(bs.totalAssets)}
                sub="What we own"
                icon={TrendingUp}
                positive
              />
              <StatTile
                label="Total Liabilities"
                value={formatAmount(bs.totalLiabilities)}
                sub="What we owe"
                icon={TrendingDown}
                positive={false}
              />
              <StatTile
                label="Owner Equity"
                value={formatAmount(bs.totalEquity)}
                sub={`Assets − Liabilities = ${formatAmount(bs.totalAssets - bs.totalLiabilities)}`}
                icon={Scale}
                positive={bs.totalEquity >= 0}
              />
            </div>
          ) : null}

          {/* Formula legend */}
          {bs && (
            <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.01] p-4 flex items-center justify-center gap-2 text-xs text-gray-600">
              <span className="text-blue-400 font-bold">Assets</span>
              <span>=</span>
              <span className="text-orange-400 font-bold">Liabilities</span>
              <span>+</span>
              <span className="text-purple-400 font-bold">Equity</span>
              <span className="mx-2 text-white/10">|</span>
              <span className={bs.isBalanced ? 'text-emerald-400' : 'text-red-400'}>
                {formatAmount(bs.totalAssets)} = {formatAmount(bs.totalLiabilities + bs.totalEquity)}
              </span>
            </div>
          )}
        </div>

        {/* Quick nav to Expenses */}
        <div className="flex items-center justify-center pt-4">
          <Link
            href="/admin/expenses"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <PieChart className="h-4 w-4" />
            Manage Expenses
          </Link>
        </div>
      </main>
    </div>
  )
}
