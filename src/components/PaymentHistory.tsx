'use client'

import { useCurrency } from '@/contexts/CurrencyContext'
import { Calendar, DollarSign, Plus } from 'lucide-react'

interface Payment {
  id: string
  amount: number
  date: Date
}

interface PaymentHistoryProps {
  payments: Payment[]
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  const { formatAmount } = useCurrency()
  
  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 shadow-2xl h-full flex flex-col mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-green-500/20 flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Payment History
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 max-h-[300px] custom-scrollbar">
        {payments && payments.length > 0 ? (
          payments.map((payment) => (
            <div 
              key={payment.id} 
              className="flex items-center justify-between p-4 bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 border border-white/10 hover:border-green-500/30 rounded-xl transition-all duration-300 group"
            >
              <div className="flex flex-col">
                <span className="text-xl font-bold text-green-400 group-hover:scale-105 transition-transform origin-left">
                  {formatAmount(payment.amount)}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(payment.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 group-hover:border-green-500/50 transition-colors">
                <Plus className="h-4 w-4 text-green-400" />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-white/5 rounded-xl border border-white/5 border-dashed">
            <div className="h-12 w-12 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <DollarSign className="h-6 w-6 text-gray-600" />
            </div>
            <p className="text-gray-500 text-sm">No payments recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
