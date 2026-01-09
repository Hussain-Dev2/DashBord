'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import useSWR from 'swr'

type Currency = 'USD' | 'IQD'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatAmount: (amount: number) => string
  exchangeRate: number
  lastUpdated: string | null
  isLoading: boolean
}

interface ExchangeRateResponse {
  result: string
  documentation: string
  terms_of_use: string
  time_last_update_unix: number
  time_last_update_utc: string
  time_next_update_unix: number
  time_next_update_utc: string
  base_code: string
  conversion_rates: {
    IQD: number
    [key: string]: number
  }
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// Your API key
const API_KEY = 'cd66a5b7924f28b8a8f2881e'
// Fallback rate in case API fails
const FALLBACK_RATE = 1470

// Fetcher function for SWR
const fetcher = async (url: string): Promise<number> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch exchange rate')
  }
  const data: ExchangeRateResponse = await response.json()
  return data.conversion_rates.IQD
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD')

  // Use SWR to fetch exchange rate with automatic revalidation
  const { data: exchangeRate, error, isLoading } = useSWR(
    `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`,
    fetcher,
    {
      refreshInterval: 3600000, // Refresh every hour (3,600,000 ms)
      revalidateOnFocus: false, // Don't refetch when window regains focus
      revalidateOnReconnect: true, // Refetch when internet reconnects
      dedupingInterval: 3600000, // Dedupe requests within 1 hour
      fallbackData: FALLBACK_RATE, // Use fallback immediately while loading
    }
  )

  // Calculate last updated time from SWR
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    if (exchangeRate && !error) {
      setLastUpdated(new Date().toLocaleString())
    }
  }, [exchangeRate, error])

  // Load currency preference from localStorage on mount
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
    const currentRate = exchangeRate || FALLBACK_RATE
    if (currency === 'IQD') {
      const iqdAmount = amount * currentRate
      return `${iqdAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })} IQD`
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <CurrencyContext.Provider 
      value={{ 
        currency, 
        setCurrency, 
        formatAmount, 
        exchangeRate: exchangeRate || FALLBACK_RATE, 
        lastUpdated,
        isLoading 
      }}
    >
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
