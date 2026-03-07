'use client'

// استيراد أدوات React والأيقونات
// Import React hooks and Lucide icons
import React, { useState } from 'react'
import { Plus, X, User, Building2, Phone, ImageIcon, DollarSign, Link as LinkIcon, Github } from 'lucide-react'
// استيراد السياقات لاستخدام البيانات واللغة والعملة
// Import contexts for data, language, and currency
import { useClients } from '@/contexts/ClientsContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCurrency } from '@/contexts/CurrencyContext'

// تعريف نوع بيانات نموذج إنشاء عميل
// Define interface for create client form data
interface CreateClientData {
    name: string
    industry: string
    phone: string
    logoUrl: string
    projectUrl: string
    repoUrl: string
    priceQuoted: string
    amountPaid: string
}

// مكون نافذة إضافة عميل جديد
// Create Client Modal Component
export function CreateClientModal({ variant = 'default' }: { variant?: 'default' | 'mobile-nav' }) {
  const { addClient } = useClients() // وظيفة إضافة عميل
  const { t } = useLanguage() // وظيفة الترجمة
  const { currency, exchangeRate } = useCurrency() // بيانات العملة وسعر الصرف
  const [isOpen, setIsOpen] = useState(false) // حالة فتح/إغلاق النافذة
  const [isSubmitting, setIsSubmitting] = useState(false) // حالة إرسال النموذج
  const [formData, setFormData] = useState<CreateClientData>({ // بيانات الحقول
    name: '',
    industry: '',
    phone: '',
    logoUrl: '',
    projectUrl: '',
    repoUrl: '',
    priceQuoted: '',
    amountPaid: '',
  })

  // معالجة إرسال النموذج
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      let priceQuoted = formData.priceQuoted ? parseFloat(formData.priceQuoted) : 0
      let amountPaid = formData.amountPaid ? parseFloat(formData.amountPaid) : 0

      // تحويل المبالغ من الدينار العراقي إلى الدولار قبل الحفظ إذا لزم الأمر
      // Convert from IQD to USD before saving if necessary
      if (currency === 'IQD') {
        priceQuoted = priceQuoted / exchangeRate
        amountPaid = amountPaid / exchangeRate
      }

      // استدعاء وظيفة الإضافة
      await addClient({
        ...formData,
        priceQuoted,
        amountPaid,
      })
      
      setIsOpen(false) // إغلاق النافذة بعد النجاح
      setFormData({ // إعادة ضبط الحقول
        name: '',
        industry: '',
        phone: '',
        logoUrl: '',
        projectUrl: '',
        repoUrl: '',
        priceQuoted: '',
        amountPaid: '',
      })
    } catch (error) {
      console.error('Failed to create client:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      {/* زر فتح النافذة */}
      {/* في الجوال يظهر كزر عائم (FAB) وفي الحاسوب يظهر بشكل طبيعي في الأعلى */}
      {variant === 'mobile-nav' ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-200 active:scale-95 hover:scale-105"
          style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-hover))', color: 'var(--slate-950)' }}
        >
          <Plus className="h-7 w-7" />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg"
          style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-hover))', color: 'var(--slate-950)' }}
        >
          <Plus className="h-5 w-5" />
          <span className="hidden md:inline">{t('add_client')}</span>
        </button>
      )}

      {/* محتوى النافذة المنبثقة (Modal) */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50">
          <div className="glass-panel rounded-t-3xl md:rounded-2xl p-6 md:p-8 max-w-4xl w-full max-h-[85vh] md:max-h-[90vh] overflow-y-auto relative animate-slide-up">
            
            {/* زخرفة في الخلفية */}
            <div className="absolute top-0 right-0 p-32 blur-[100px] rounded-full pointer-events-none" style={{ background: 'rgba(212,175,55,0.05)' }} />
            
            {/* رأس النافذة */}
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{t('add_client')}</h2>
                <p className="text-gray-400">Enter the details below to create a new client project.</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="group p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-400 group-hover:text-white" />
              </button>
            </div>

            {/* نموذج البيانات */}
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              
              {/* القسم الأول: المعلومات الأساسية */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--gold)' }}>
                  <User className="h-4 w-4" /> {t('client_name')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* حقل اسم العميل */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">{t('client_name')} *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 glass-input"
                        placeholder="e.g. Acme Corp"
                        required
                      />
                    </div>
                  </div>

                  {/* حقل مجال العمل */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">{t('industry')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 glass-input"
                        placeholder="e.g. Technology"
                      />
                    </div>
                  </div>
                  
                  {/* حقل رقم الهاتف */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">{t('phone')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 glass-input"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  {/* حقل رابط الشعار */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">Logo URL</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                        <ImageIcon className="h-5 w-5 text-gray-500 group-focus-within:text-yellow-400 transition-colors" />
                      </div>
                      <input
                        type="url"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 glass-input"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* القسم الثاني: المعلومات المالية */}
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--gold)' }}>
                  <DollarSign className="h-4 w-4" /> {t('financials')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* حقل السعر المعروض */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">{t('price_quoted')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                        <span className="text-gray-500 group-focus-within:text-nexa-gold font-bold transition-colors">
                          {currency === 'USD' ? '$' : 'IQD'}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.priceQuoted}
                        onChange={(e) => setFormData({ ...formData, priceQuoted: e.target.value })}
                        className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-3 glass-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  {/* حقل الدفعة الأولية */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">{t('initial_payment')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                        <span className="text-gray-500 group-focus-within:text-nexa-gold font-bold transition-colors">
                          {currency === 'USD' ? '$' : 'IQD'}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.amountPaid}
                        onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                        className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-3 glass-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* القسم الثالث: الروابط */}
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--gold)' }}>
                  <LinkIcon className="h-4 w-4" /> {t('project_url')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* حقل رابط المشروع */}
                   <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">{t('project_url')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                         <LinkIcon className="h-5 w-5 text-gray-500 group-focus-within:text-[color:var(--gold)] transition-colors" />
                      </div>
                      <input
                        type="url"
                        value={formData.projectUrl}
                        onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                        className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 glass-input"
                        placeholder="https://client-site.com"
                      />
                    </div>
                  </div>

                  {/* حقل رابط المستودع (GitHub) */}
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">{t('repo_url')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                         <Github className="h-5 w-5 text-gray-500 group-focus-within:text-[color:var(--gold)] transition-colors" />
                      </div>
                      <input
                        type="url"
                        value={formData.repoUrl}
                        onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                        className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 glass-input"
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* أزرار الإجراءات في أسفل النافذة */}
              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold transition-all duration-200 disabled:opacity-70 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-hover))', color: 'var(--slate-950)' }}
                >
                  <Plus className="h-5 w-5" />
                  {isSubmitting ? t('creating') : t('create_client')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-6 py-4 glass-button-secondary rounded-xl font-semibold"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
