'use client'

// استيراد أدوات React الأساسية
// Import core React hooks and utilities
import { useState, useEffect } from 'react'
// استيراد أداة لإنشاء عناصر خارج شجرة DOM الحالية
// Import createPortal to render components outside the current DOM tree
import { createPortal } from 'react-dom'
// استيراد أنواع البيانات من Prisma
import { Status } from '@prisma/client'
// استيراد أداة التوجيه من Next.js
import { useRouter } from 'next/navigation'
// استيراد الأيقونات
import { Pencil, Save, X, Trash2, Loader2 } from 'lucide-react'
// استيراد سياقات العملة والعملاء
import { useCurrency } from '@/contexts/CurrencyContext'
import { useClients } from '@/contexts/ClientsContext'
// استيراد أداة عرض التنبيهات
import { toast } from 'sonner'


type Client = {
  id: string
  name: string
  industry: string | null
  phone: string | null
  logoUrl: string | null
  projectUrl: string | null
  repoUrl: string | null
  status: Status
  priceQuoted: number
  amountPaid: number
}

// مكون نموذج تعديل بيانات العميل
// Client Edit Form Component
export function ClientEditForm({ client }: { client: Client }) {
  const router = useRouter() // الموجه للتنقل بين الصفحات
  const { currency, exchangeRate } = useCurrency() // بيانات العملة وسعر الصرف
  const { updateClientFn, deleteClientFn } = useClients() // وظائف التعديل والحذف
  const [isEditing, setIsEditing] = useState(false) // حالة التعديل (فتح النافذة)
  const [isDeleting, setIsDeleting] = useState(false) // حالة جاري الحذف
  const [isSaving, setIsSaving] = useState(false) // حالة جاري الحفظ
  const [mounted, setMounted] = useState(false) // حالة تركيب المكون في المتصفح

  // وظيفة للحصول على القيم الابتدائية للنموذج مع تحويل العملة إذا لزم الأمر
  // Helper to get initial form values with currency conversion
  const getInitialValues = () => {
    let pq = client.priceQuoted
    let ap = client.amountPaid
    
    // تحويل المبالغ من الدولار إلى الدينار العراقي للعرض
    if (currency === 'IQD') {
      pq = pq * exchangeRate
      ap = ap * exchangeRate
    }

    return {
      name: client.name,
      industry: client.industry || '',
      phone: client.phone || '',
      logoUrl: client.logoUrl || '',
      projectUrl: client.projectUrl || '',
      repoUrl: client.repoUrl || '',
      status: client.status,
      // عرض القيم الفارغة إذا كانت صفر لسهولة الإدخال
      priceQuoted: pq === 0 ? '' : pq.toFixed(0),
      amountPaid: ap === 0 ? '' : ap.toFixed(0),
    }
  }

  const [formData, setFormData] = useState(getInitialValues()) // بيانات الحقول

  // تحديث البيانات عند فتح نافذة التعديل أو تغيير العملة
  useEffect(() => {
    if (isEditing) {
      setFormData(getInitialValues())
    }
  }, [isEditing, currency])

  // التأكد من أن المكون تم تركيبه في المتصفح (لأغراض Portal)
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // معالجة حفظ التغييرات
  // Handle saving changes
  const handleSave = async () => {
    setIsSaving(true)
    try {
      let priceQuoted = formData.priceQuoted ? parseFloat(formData.priceQuoted as string) : 0
      let amountPaid = formData.amountPaid ? parseFloat(formData.amountPaid as string) : 0

      // تحويل المبالغ مرة أخرى إلى الدولار لحفظها في قاعدة البيانات
      // Convert back to USD if in IQD mode
      if (currency === 'IQD') {
        priceQuoted = priceQuoted / exchangeRate
        amountPaid = amountPaid / exchangeRate
      }

      // استدعاء وظيفة التحديث
      await updateClientFn(client.id, {
        ...formData,
        priceQuoted,
        amountPaid,
      })
      setIsEditing(false) // إغلاق النافذة
      router.refresh() // تحديث بيانات الصفحة
      toast.success('Client updated successfully')
    } catch (error) {
      console.error('Failed to update client:', error)
      toast.error('Failed to update client')
    } finally {
      setIsSaving(false)
    }
  }

  // معالجة حذف العميل
  // Handle client deletion
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
      return
    }
    
    setIsDeleting(true)
    try {
      await deleteClientFn(client.id)
      router.push('/admin') // العودة للوحة التحكم بعد الحذف
    } catch (error) {
      console.error('Failed to delete client:', error)
      toast.error('Failed to delete client')
      setIsDeleting(false)
    }
  }

  // إذا لم يكن في وضع التعديل، اعرض أزرار "تعديل" و "حذف"
  if (!isEditing) {
    return (
      <div className="flex gap-3">
        {/* زر فتح نافذة التعديل */}
        <button
          onClick={() => {
            setIsEditing(true)
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-nexa-gold to-nexa-goldHover text-nexa-black rounded-xl font-semibold hover:shadow-lg hover:shadow-nexa-gold/50 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Pencil className="h-4 w-4" />
          Edit Client
        </button>
        {/* زر الحذف */}
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600/20 text-red-400 border-2 border-red-600/50 rounded-xl font-semibold hover:bg-red-600/30 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95"
        >
          {isDeleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete
            </>
          )}
        </button>
      </div>
    )
  }

  // محتوى نافذة التعديل (Modal)
  const modalContent = (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto">
      <div className="bg-gradient-to-br from-nexa-gray to-nexa-black border-2 border-white/20 rounded-2xl p-8 max-w-4xl w-full my-8 shadow-2xl">
        {/* رأس النافذة */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-nexa-gold to-white bg-clip-text text-transparent">
            Edit Client
          </h2>
          <button
            onClick={() => {
              setIsEditing(false)
            }}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* شبكة حقول الإدخال */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* اسم العميل */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Client Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300"
              required
            />
          </div>

          {/* مجال العمل */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Industry</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300"
              placeholder="e.g., E-Commerce"
            />
          </div>

          {/* رقم الهاتف */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300"
              placeholder="+1234567890"
            />
          </div>

          {/* الحالة */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300"
            >
              <option value="LEAD">LEAD</option>
              <option value="PENDING">PENDING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>

          {/* السعر المعروض (يظهر بالعملة المختارة) */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Price Quoted ({currency})</label>
            <input
              type="number"
              value={formData.priceQuoted}
              onChange={(e) => setFormData({ ...formData, priceQuoted: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          {/* المبلغ المدفوع */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Amount Paid ({currency})</label>
            <input
              type="number"
              value={formData.amountPaid}
              onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          {/* رابط شعار العميل */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Logo URL</label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300"
              placeholder="https://example.com/logo.png"
            />
          </div>

          {/* رابط المشروع */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Project URL</label>
            <input
              type="url"
              value={formData.projectUrl}
              onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300"
              placeholder="https://project.com"
            />
          </div>

          {/* رابط مستودع الكود (GitHub) */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Repository URL</label>
            <input
              type="url"
              value={formData.repoUrl}
              onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300"
              placeholder="https://github.com/username/repo"
            />
          </div>
        </div>

        {/* أزرار الإجراءات (حفظ أو إلغاء) */}
        <div className="flex gap-3 pt-8 border-t border-white/10 mt-8">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-nexa-gold to-nexa-goldHover text-nexa-black rounded-xl font-semibold hover:shadow-lg hover:shadow-nexa-gold/50 transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIsEditing(false)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white border-2 border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  // عرض النافذة المنبثقة باستخدام Portal لضمان ظهورها فوق كل العناصر
  return mounted ? createPortal(modalContent, document.body) : null
}
