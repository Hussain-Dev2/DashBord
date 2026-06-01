'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Plus, Receipt, Trash2, Calendar,
  CreditCard, Banknote, Wallet, X, AlertCircle
} from 'lucide-react'
import { useExpenses, useCreateExpense } from '@/hooks/useAccounting'
import { useChartOfAccounts } from '@/hooks/useAccounting'
import { useCurrency } from '@/contexts/CurrencyContext'
import type { CreateExpenseData, PaymentMethodType } from '@/lib/types'
import { toast } from 'sonner'

const METHOD_ICONS: Record<PaymentMethodType, React.ElementType> = {
  Cash: Banknote,
  Bank: CreditCard,
  Card: Wallet,
}

const METHOD_COLORS: Record<PaymentMethodType, string> = {
  Cash:  'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  Bank:  'text-blue-400    bg-blue-500/10    border-blue-500/20',
  Card:  'text-purple-400  bg-purple-500/10  border-purple-500/20',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Add Expense Modal ──────────────────────────────────────
function AddExpenseModal({ onClose }: { onClose: () => void }) {
  const { data: accounts = [] } = useChartOfAccounts()
  const createExpense = useCreateExpense()

  const expenseAccounts = accounts.filter(a => a.type === 'Expense')

  const [form, setForm] = useState<{
    category_account_id: string
    amount: string
    payment_method: PaymentMethodType
    date: string
    description: string
    receipt_url: string
  }>({
    category_account_id: '',
    amount: '',
    payment_method: 'Cash',
    date: new Date().toISOString().split('T')[0],
    description: '',
    receipt_url: '',
  })

  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.category_account_id) { setError('Please select an expense category'); return }
    if (!form.amount || Number(form.amount) <= 0) { setError('Amount must be positive'); return }

    const data: CreateExpenseData = {
      category_account_id: form.category_account_id,
      amount: Number(form.amount),
      payment_method: form.payment_method,
      date: new Date(form.date).toISOString(),
      description: form.description || undefined,
      receipt_url: form.receipt_url || undefined,
    }

    try {
      await createExpense.mutateAsync(data)
      toast.success('Expense recorded and journal entry created')
      onClose()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create expense'
      setError(msg)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6 z-50">
      <div className="bg-slate-900 border border-white/10 rounded-t-[2.5rem] md:rounded-[2rem] p-8 max-w-md w-full max-h-[95vh] overflow-y-auto animate-in fade-in slide-in-from-bottom-10 duration-300">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Add Expense</h2>
            <div className="h-1 w-10 bg-amber-400 rounded-full mt-1" />
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all"
          >
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Expense Category</label>
            <select
              value={form.category_account_id}
              onChange={e => setForm(f => ({ ...f, category_account_id: e.target.value }))}
              className="w-full bg-white/[0.03] border border-white/8 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-amber-400/40 transition-colors"
            >
              <option value="">Select category...</option>
              {expenseAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.account_number} — {a.name}</option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Amount (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">$</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                placeholder="0.00"
                className="w-full pl-9 pr-4 py-3 bg-white/[0.03] border border-white/8 rounded-xl text-white font-bold text-sm outline-none focus:border-amber-400/40 transition-colors"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Cash', 'Bank', 'Card'] as PaymentMethodType[]).map(method => {
                const Icon = METHOD_ICONS[method]
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, payment_method: method }))}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-bold transition-all ${
                      form.payment_method === method
                        ? METHOD_COLORS[method]
                        : 'bg-white/[0.02] border-white/8 text-gray-600 hover:text-gray-400'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {method}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full pl-10 pr-4 py-3 bg-white/[0.03] border border-white/8 rounded-xl text-white text-sm outline-none focus:border-amber-400/40 transition-colors"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Description <span className="text-gray-700">(optional)</span></label>
            <input
              type="text"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description..."
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/8 rounded-xl text-white text-sm outline-none focus:border-amber-400/40 transition-colors"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={createExpense.isPending}
              className="flex-1 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #b8961e)', color: '#0d0f1a' }}
            >
              {createExpense.isPending ? (
                <div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <><Plus className="h-4 w-4" />Record Expense</>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3.5 rounded-xl border border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-all text-sm font-bold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────
export default function ExpensesPage() {
  const { formatAmount } = useCurrency()
  const { data: expenses = [], isLoading } = useExpenses()
  const [showModal, setShowModal] = useState(false)

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div
      className="min-h-screen text-white pb-12"
      style={{ background: 'linear-gradient(160deg, #0d0f1a 0%, #111327 60%, #0d0f1a 100%)' }}
    >
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl border-b border-white/8 bg-slate-900/60 px-4 md:px-8 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/analytics" className="text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Receipt className="h-4 w-4 text-red-400" />
              </div>
              <h1 className="text-base font-bold text-white">Expenses</h1>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #b8961e)', color: '#0d0f1a' }}
          >
            <Plus className="h-4 w-4" />
            Add Expense
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 md:px-8 pt-6 space-y-5">
        {/* Total */}
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Total Expenses (All Time)</p>
            <p className="text-3xl font-black text-white mt-1">{formatAmount(totalExpenses)}</p>
          </div>
          <div className="h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Receipt className="h-7 w-7 text-red-400" />
          </div>
        </div>

        {/* Expense list */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
          <div className="px-5 py-4 border-b border-white/8">
            <h2 className="text-sm font-bold text-white">Expense Log</h2>
            <p className="text-xs text-gray-600 mt-0.5">{expenses.length} records · All journal entries auto-created</p>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-white/[0.02] animate-pulse" />
              ))}
            </div>
          ) : expenses.length === 0 ? (
            <div className="p-12 text-center">
              <Receipt className="h-10 w-10 text-gray-700 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No expenses recorded yet.</p>
              <p className="text-gray-700 text-xs mt-1">Add your first expense to start tracking.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {expenses.map(expense => {
                const MethodIcon = METHOD_ICONS[expense.payment_method]
                return (
                  <div key={expense.id} className="px-5 py-4 flex items-center gap-4 hover:bg-white/[0.01] transition-colors">
                    <div className={`h-10 w-10 rounded-xl border flex items-center justify-center shrink-0 ${METHOD_COLORS[expense.payment_method]}`}>
                      <MethodIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        {expense.description || expense.account?.name || 'Expense'}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-600">{expense.account?.name}</span>
                        <span className="text-gray-700">·</span>
                        <span className="text-xs text-gray-600">{formatDate(expense.date)}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${METHOD_COLORS[expense.payment_method]}`}>
                          {expense.payment_method}
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-black text-red-400">−{formatAmount(expense.amount)}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {showModal && <AddExpenseModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
