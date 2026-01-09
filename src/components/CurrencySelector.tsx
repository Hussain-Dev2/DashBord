'use client'

import { DollarSign } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'

export function CurrencySelector() {
  const { currency, setCurrency, exchangeRate, lastUpdated } = useCurrency()

  return (
    <div className="relative group">
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
        <button
          onClick={() => setCurrency('USD')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            currency === 'USD'
              ? 'bg-nexa-gold text-nexa-black shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          USD
        </button>
        <button
          onClick={() => setCurrency('IQD')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
            currency === 'IQD'
              ? 'bg-nexa-gold text-nexa-black shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="text-sm">IQD</span>
        </button>
      </div>
      
      {/* Tooltip showing exchange rate */}
      <div className="absolute top-full mt-2 right-0 bg-nexa-gray/95 border border-nexa-gold/30 rounded-lg px-3 py-2 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-xl">
        <div className="text-nexa-gold font-semibold">USD → IQD</div>
        <div className="text-gray-300">1 USD = {exchangeRate.toLocaleString('en-US', { maximumFractionDigits: 2 })} IQD</div>
        {lastUpdated && (
          <div className="text-gray-500 text-[10px] mt-1">Updated: {lastUpdated}</div>
        )}
      </div>
    </div>
  )
}
