'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, X, Plus, Minus, TrendingDown, TrendingUp, AlertCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useClients } from '@/contexts/ClientsContext'
import { toast } from 'sonner'

interface QuickPaymentUpdateProps {
  clientId: string
  currentAmount: number   // amountPaid
  totalAmount: number     // priceQuoted (total debt)
}

type Mode = 'ADD_PAYMENT' | 'ADD_DEBT' | null

export function QuickPaymentUpdate({ clientId, currentAmount, totalAmount }: QuickPaymentUpdateProps) {
  const [mode, setMode] = useState<Mode>(null)
  const [amount, setAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [inputError, setInputError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { currency, exchangeRate, formatAmount } = useCurrency()
  const { addPaymentFn, addDebtFn, updateClientFn } = useClients()

  const remainingBalance = Math.max(0, totalAmount - currentAmount)
  const isFullyPaid = remainingBalance <= 0.01
  const progress = totalAmount > 0 ? Math.min(100, (currentAmount / totalAmount) * 100) : 0

  useEffect(() => {
    if (mode !== null) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [mode])

  const openMode = (m: Mode) => {
    setAmount('')
    setInputError(null)
    setMode(m)
  }

  const cancel = () => {
    setMode(null)
    setAmount('')
    setInputError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setInputError(null)

    if (!amount || amount.trim() === '') {
      setInputError('Please enter a valid amount')
      return
    }

    let raw = parseFloat(amount)
    if (isNaN(raw) || raw <= 0) {
      setInputError('Please enter a valid positive amount')
      return
    }

    setIsLoading(true)
    try {
      if (currency === 'IQD') raw = raw / exchangeRate

      if (mode === 'ADD_PAYMENT') {
        await addPaymentFn(clientId, raw)
      } else if (mode === 'ADD_DEBT') {
        // Record debt in history + update total
        await addDebtFn(clientId, raw)
      }

      cancel()
    } catch (err) {
      console.error(err)
      toast.error('Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const currSymbol = currency === 'USD' ? '$' : 'IQ'

  // ── Expanded input form ──
  if (mode !== null) {
    const isAdd = mode === 'ADD_PAYMENT'
    return (
      <div className="animate-scale-in">
        <form onSubmit={handleSubmit}>
          {/* Title row */}
          <div className={`flex items-center gap-2 mb-2.5 text-xs font-semibold uppercase tracking-wider ${isAdd ? 'text-green-400' : 'text-red-400'}`}>
            {isAdd ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
            {isAdd ? 'Record Payment' : 'Add Debt Amount'}
          </div>

          <div className="flex items-center gap-2">
            {/* Amount input */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className={`text-sm font-bold ${isAdd ? 'text-green-400' : 'text-red-400'}`}>
                    {currSymbol}
                  </span>
                </div>
                <input
                  ref={inputRef}
                  type="number"
                  value={amount}
                  onChange={(e) => { setAmount(e.target.value); setInputError(null) }}
                  placeholder={isAdd
                    ? (currency === 'USD' ? `Max ${formatCurrency(remainingBalance)}` : `Max ${Math.round(remainingBalance * exchangeRate).toLocaleString()}`)
                    : 'Amount to add'
                  }
                  className={`
                    w-full pl-9 pr-3 py-2.5 rounded-xl text-white font-medium text-sm
                    bg-white/5 transition-all
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
                    ${inputError
                      ? 'border border-red-500 focus:outline-none'
                      : isAdd
                        ? 'border border-green-500/30 focus:border-green-500 focus:ring-2 focus:ring-green-500/15 focus:outline-none'
                        : 'border border-red-500/30 focus:border-red-500 focus:ring-2 focus:ring-red-500/15 focus:outline-none'
                    }
                  `}
                  step="0.01"
                  min="0.01"
                  autoFocus
                />
              </div>
              {/* Visible inline validation error */}
              {inputError && (
                <div className="flex items-center gap-1 mt-1.5 text-red-400 text-xs" role="alert">
                  <AlertCircle className="h-3 w-3 shrink-0" />
                  <span>{inputError}</span>
                </div>
              )}
            </div>

            {/* Confirm */}
            <button
              type="submit"
              disabled={isLoading}
              className={`
                p-2.5 rounded-xl transition-all font-bold
                disabled:opacity-40 disabled:cursor-not-allowed
                ${isAdd
                  ? 'bg-green-500/20 hover:bg-green-500/35 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 hover:bg-red-500/35 text-red-400 border border-red-500/30'
                }
              `}
              title="Confirm"
            >
              {isLoading
                ? <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                : <Check className="h-4 w-4" />
              }
            </button>

            {/* Cancel */}
            <button
              type="button"
              onClick={cancel}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 transition-all"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    )
  }

  // ── Default view: progress + quick action buttons ──
  return (
    <div className="space-y-2.5">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-400">
            Paid: <span className="text-white font-medium">{formatAmount(currentAmount)}</span>
          </span>
          {!isFullyPaid && (
            <span className="text-red-400 font-semibold">
              Due: {formatAmount(remainingBalance)}
            </span>
          )}
          {isFullyPaid && (
            <span className="text-green-400 font-semibold">✓ Paid</span>
          )}
        </div>
        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${progress}%`,
              background: isFullyPaid
                ? 'linear-gradient(90deg, #22c55e, #4ade80)'
                : progress > 60
                  ? 'linear-gradient(90deg, #D4AF37, #fbbf24)'
                  : 'linear-gradient(90deg, #ef4444, #f87171)',
            }}
          />
        </div>
      </div>

      {/* Quick action buttons */}
      <div className="flex gap-2">
        {/* Add Money (reduce debt) */}
        <button
          id={`add-payment-${clientId}`}
          onClick={(e) => { e.stopPropagation(); openMode('ADD_PAYMENT') }}
          className="quick-btn-add flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
          title="Client paid – reduce debt"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Money
        </button>

        {/* Add Debt */}
        <button
          id={`add-debt-${clientId}`}
          onClick={(e) => { e.stopPropagation(); openMode('ADD_DEBT') }}
          className="quick-btn-debt flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
          title="Add new debt amount"
        >
          <Minus className="h-3.5 w-3.5" />
          Add Debt
        </button>
      </div>
    </div>
  )
}
