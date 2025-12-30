'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Currency = 'USD' | 'IQD'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatAmount: (amount: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD')

  // Load currency from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferred-currency')
    if (saved === 'USD' || saved === 'IQD') {
      setCurrencyState(saved)
    }
  }, [])

  // Save currency to localStorage when it changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('preferred-currency', newCurrency)
  }

  // Format amount based on selected currency
  const formatAmount = (amount: number): string => {
    if (currency === 'IQD') {
      // 1 USD = approximately 1,310 IQD (you can adjust this rate)
      const iqdAmount = amount * 1310
      return `${iqdAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })} IQD`
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}
