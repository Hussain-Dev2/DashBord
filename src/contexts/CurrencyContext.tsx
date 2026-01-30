'use client'

// استيراد أدوات مكتبة React ومكتبة SWR لجلب البيانات
// Import React hooks and SWR for data fetching
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import useSWR from 'swr'

// تعريف أنواع العملات المدعومة
type Currency = 'USD' | 'IQD'

// تعريف هيكل بيانات سياق العملة
interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatAmount: (amount: number) => string
  exchangeRate: number
  lastUpdated: string | null
  isLoading: boolean
}

// تعريف واجهة رد استجابة API سعر الصرف
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

// إنشاء سياق العملة
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

// مفتاح API لخدمة سعر الصرف
const API_KEY = 'cd66a5b7924f28b8a8f2881e'
// سعر الصرف الاحتياطي في حال فشل الاتصال بـ API
const FALLBACK_RATE = 1470

// دالة جلب البيانات الخاصة بـ SWR
const fetcher = async (url: string): Promise<number> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error('Failed to fetch exchange rate')
  }
  const data: ExchangeRateResponse = await response.json()
  return data.conversion_rates.IQD
}

// موفر سياق العملة (Wrapper)
export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>('USD') // العملة المحددة حالياً

  // استخدام SWR لجلب سعر الصرف تلقائياً وتحديثه كل ساعة
  // Use SWR to fetch exchange rate with automatic revalidation
  const { data: exchangeRate, error, isLoading } = useSWR(
    `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`,
    fetcher,
    {
      refreshInterval: 3600000, // تحديث كل ساعة
      revalidateOnFocus: false, // عدم التحديث عند العودة للنافذة
      revalidateOnReconnect: true, // التحديث عند عودة الاتصال
      dedupingInterval: 3600000, // منع الطلبات المتكررة خلال ساعة
      fallbackData: FALLBACK_RATE, // استخدام السعر الاحتياطي فوراً أثناء التحميل
    }
  )

  // حالة لتسجيل آخر وقت تم فيه التحديث
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)

  useEffect(() => {
    if (exchangeRate && !error) {
      setLastUpdated(new Date().toLocaleString())
    }
  }, [exchangeRate, error])

  // تحميل العملة المفضلة من التخزين المحلي عند البدء
  useEffect(() => {
    const saved = localStorage.getItem('preferred-currency')
    if (saved === 'USD' || saved === 'IQD') {
      setCurrencyState(saved)
    }
  }, [])

  // دالة تغيير العملة وحفظها في التخزين المحلي
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    localStorage.setItem('preferred-currency', newCurrency)
  }

  // دالة تنسيق المبالغ المالية بناءً على العملة المحددة
  const formatAmount = (amount: number): string => {
    const currentRate = exchangeRate || FALLBACK_RATE
    if (currency === 'IQD') {
      // التحويل من الدولار إلى الدينار العراقي
      const iqdAmount = amount * currentRate
      return `${iqdAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })} IQD`
    }
    // التنسيق بالدولار الأمريكي
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

// خطاف (Hook) مخصص لاستخدام سياق العملة بسهولة في المكونات
export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider')
  }
  return context
}
