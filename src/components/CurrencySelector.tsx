'use client'

import { DollarSign } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency()

  return (
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
  )
}
