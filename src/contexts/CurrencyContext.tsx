'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Currency = 'USD' | 'IQD'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatAmount: (amount: number) => string
  exchangeRate: number
  lastUpdated: string | null
}

interface ExchangeRateCache {
  rate: number
  timestamp: number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// Fallback rate in case API fails
const FALLBACK_RATE = 1310

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD')
  const [exchangeRate, setExchangeRate] = useState<number>(FALLBACK_RATE)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  // Load currency from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('preferred-currency')
    if (saved === 'USD' || saved === 'IQD') {
      setCurrencyState(saved)
    }
  }, [])

  // Fetch and cache exchange rate
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        // Check cache first (update once per day)
        const cached = localStorage.getItem('usd-iqd-rate')
        if (cached) {
          const cacheData: ExchangeRateCache = JSON.parse(cached)
          const now = Date.now()
          const oneDayMs = 24 * 60 * 60 * 1000
          
          // Use cached rate if less than 24 hours old
          if (now - cacheData.timestamp < oneDayMs) {
            setExchangeRate(cacheData.rate)
            setLastUpdated(new Date(cacheData.timestamp).toLocaleDateString())
            return
          }
        }

        // Fetch fresh rate from API
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD')
        
        if (!response.ok) {
          throw new Error('Failed to fetch exchange rate')
        }

        const data = await response.json()
        const rate = data.rates?.IQD

        if (rate && typeof rate === 'number') {
          setExchangeRate(rate)
          const now = Date.now()
          setLastUpdated(new Date(now).toLocaleDateString())
          
          // Cache the rate
          const cacheData: ExchangeRateCache = {
            rate,
            timestamp: now
          }
          localStorage.setItem('usd-iqd-rate', JSON.stringify(cacheData))
        } else {
          // Use fallback if rate not found
          console.warn('IQD rate not found in API response, using fallback')
          setExchangeRate(FALLBACK_RATE)
        }
      } catch (error) {
        console.error('Error fetching exchange rate:', error)
        // Use fallback rate on error
        setExchangeRate(FALLBACK_RATE)
        setLastUpdated('Offline')
      }
    }

    fetchExchangeRate()
  }, [])

  // Save currency to localStorage when it changes
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('preferred-currency', newCurrency)
  }

  // Format amount based on selected currency
  const formatAmount = (amount: number): string => {
    if (currency === 'IQD') {
      const iqdAmount = amount * exchangeRate
      return `${iqdAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })} IQD`
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatAmount, exchangeRate, lastUpdated }}>
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
