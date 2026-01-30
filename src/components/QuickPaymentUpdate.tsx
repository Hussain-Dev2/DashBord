'use client'

// استيراد أدوات React والأيقونات
// Import React hooks and Lucide icons
import { useState } from 'react'
import { Check, X, Plus, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'
// استيراد أدوات التنسيق وسياقات العملة والعملاء
// Import formatting tools and contexts
import { formatCurrency } from '@/lib/format'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useClients } from '@/contexts/ClientsContext'
import { toast } from 'sonner'

// تعريف خصائص المكون
interface QuickPaymentUpdateProps {
  clientId: string
  currentAmount: number
  totalAmount: number
}

// مكون التحديث السريع للمدفوعات
// Quick Payment Update Component
export function QuickPaymentUpdate({ clientId, currentAmount, totalAmount }: QuickPaymentUpdateProps) {
  const [isEditing, setIsEditing] = useState(false) // حالة التعديل (إظهار حقل الإدخال)
  const [amount, setAmount] = useState('') // القيمة المدخلة
  const [isLoading, setIsLoading] = useState(false) // حالة جاري الحفظ
  const router = useRouter()
  const { currency, exchangeRate, formatAmount } = useCurrency()
  const { addPaymentFn } = useClients()

  const remainingBalance = totalAmount - currentAmount // المبلغ المتبقي
  const isFullyPaid = remainingBalance <= 0.01 // هل تم الدفع بالكامل؟

  // معالجة إرسال الدفعة الجديدة
  // Handle new payment submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let paymentAmount = parseFloat(amount)
      if (isNaN(paymentAmount) || paymentAmount <= 0) {
        toast.error('Please enter a valid amount')
        return
      }

      // تحويل المبلغ إلى الدولار إذا كان الإدخال بالدينار العراقي لحفظه بشكل موحد
      // If user is in IQD mode, we must convert the input back to USD for storage
      if (currency === 'IQD') {
        paymentAmount = paymentAmount / exchangeRate
      }

      // استدعاء وظيفة إضافة دفعة
      await addPaymentFn(clientId, paymentAmount)
      
      setIsEditing(false) // إغلاق الحقل
      setAmount('') // تفريغ القيمة
      toast.success('Payment added successfully')
    } catch (error) {
      console.error('Failed to add payment:', error)
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  // عرض نموذج الإدخال عند النقر على إضافة
  if (isEditing) {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative group">
          {/* أيقونة العملة الحالية */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-green-400 font-bold">
              {currency === 'USD' ? '$' : 'IQD'}
            </span>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            // عرض الحد الأقصى المسموح به كدليل للمستخدم
            placeholder={currency === 'USD' ? `Max ${formatCurrency(remainingBalance)}` : `Max ${formatCurrency(remainingBalance * exchangeRate)}`}
            className="w-48 bg-white/5 border border-white/10 rounded-xl text-white font-medium pl-12 pr-3 py-2 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 focus:outline-none transition-all placeholder:text-gray-600 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            autoFocus
            step="0.01"
            min="0"
          />
        </div>
        <div className="flex gap-1">
          {/* زر التأكيد */}
          <button
            type="submit"
            disabled={isLoading || !amount}
            className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors backdrop-blur-sm border border-green-500/20"
            title="Confirm Payment"
          >
            <Check className="h-4 w-4" />
          </button>
          {/* زر الإلغاء */}
          <button
            type="button"
            onClick={() => {
              setIsEditing(false)
              setAmount('')
            }}
            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors backdrop-blur-sm border border-white/10"
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </form>
    )
  }

  // العرض الافتراضي: عرض المبلغ الحالي وزر الإضافة
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
        {formatAmount(currentAmount)}
      </span>
      
      {/* زر فتح حقل الإضافة */}
      <button
        onClick={() => setIsEditing(true)}
        className="group relative p-2 rounded-full hover:bg-green-500/10 transition-all duration-300"
        title="Add Payment"
      >
        <div className="bg-green-500/20 p-1.5 rounded-full border border-green-500/30 group-hover:border-green-500/60 transition-colors shadow-lg shadow-green-900/20">
           <Plus className="h-3.5 w-3.5 text-green-400 group-hover:text-green-300" />
        </div>
        <span className="absolute opacity-0 group-hover:opacity-100 -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/80 text-white px-2 py-1 rounded whitespace-nowrap transition-opacity pointer-events-none border border-white/10">
          Add Payment
        </span>
      </button>
    </div>
  )
}
