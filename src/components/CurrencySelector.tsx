'use client'

// استيراد الأيقونات والمكونات
// Import icons and components
import { DollarSign, Loader2 } from 'lucide-react'
// استيراد سياق العملة
// Import currency context
import { useCurrency } from '@/contexts/CurrencyContext'

// مكون اختيار العملة (USD / IQD)
// Currency Selector Component
export function CurrencySelector() {
  const { currency, setCurrency, exchangeRate, lastUpdated, isLoading } = useCurrency()

  return (
    <div className="relative group">
      {/* حاوية أزرار التبديل */}
      <div className="flex items-center gap-1 md:gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
        {/* زر الدولار الأمريكي */}
        <button
          onClick={() => setCurrency('USD')}
          className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm transition-all duration-300 ${
            currency === 'USD'
              ? 'bg-nexa-gold text-nexa-black shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign className="h-3 w-3 md:h-4 md:w-4" />
          USD
        </button>
        {/* زر الدينار العراقي */}
        <button
          onClick={() => setCurrency('IQD')}
          className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-1.5 md:py-2 rounded-lg font-medium text-xs md:text-sm transition-all duration-300 ${
            currency === 'IQD'
              ? 'bg-nexa-gold text-nexa-black shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          IQD
        </button>
      </div>
      
      {/* نافذة تفصيلية تظهر عند الحوم (Tooltip) لعرض سعر الصرف */}
      {/* Tooltip showing exchange rate on hover */}
      <div className="absolute top-full mt-2 right-0 bg-nexa-gray/95 border border-nexa-gold/30 rounded-lg px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
        <div className="text-nexa-gold font-semibold flex items-center gap-2">
          USD → IQD
          {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
        </div>
        <div className="text-gray-300">
          1 USD = {exchangeRate.toLocaleString('en-US', { maximumFractionDigits: 2 })} IQD
        </div>
        {lastUpdated && (
          <div className="text-gray-500 text-[10px] mt-1">Updated: {lastUpdated}</div>
        )}
      </div>
    </div>
  )
}
