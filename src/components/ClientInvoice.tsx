'use client'

// استيراد أدوات React والأيقونات والسياقات
// Import React tools, icons, and contexts
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Printer, X, FileText, CheckCircle2, AlertCircle, Clock, ShieldCheck } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { SerializedClient } from '@/lib/types'
import { formatDate } from '@/lib/format'

// مكون كشف الحساب المالي القابل للطباعة - نسخة محسنة بريميوم
// Premium Printable Statement of Account (Invoice) Component
export function ClientInvoice({ client }: { client: SerializedClient }) {
  const { t, language, dir } = useLanguage() // بيانات اللغة والترجمة
  const { formatAmount } = useCurrency() // تنسيق المبالغ المالية
  const [isOpen, setIsOpen] = useState(false) // حالة فتح نافذة المعاينة
  const [mounted, setMounted] = useState(false) // حالة تركيب المكون

  useEffect(() => {
    setMounted(true)
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      setMounted(false)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // حساب البيانات المالية
  const balance = client.priceQuoted - client.amountPaid
  const isFullyPaid = balance <= 0
  const isUnpaid = client.amountPaid === 0
  
  // دالة تشغيل الطباعة
  const handlePrint = () => {
    window.print()
  }

  // محتوى كشف الحساب (التصميم الموجه للطباعة)
  const invoiceContent = (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 overflow-hidden print:static print:bg-white print:p-0">
      
      {/* حاوية المعاينة (Modal Holder) */}
      <div className="bg-nexa-black border border-white/10 w-full max-w-[950px] max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative print:static print:p-0 print:border-none print:shadow-none print:w-[210mm] print:max-h-none print:rounded-none">
        
        {/* شريط التحكم العلوي - مدمج داخل الحاوية */}
        <div className="w-full bg-white/5 border-b border-white/10 p-4 flex justify-between items-center z-[10001] print:hidden">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-nexa-gold/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-nexa-gold" />
              </div>
              <div>
                <span className="text-white font-bold block leading-none">{t('invoice_title')}</span>
                <span className="text-gray-500 text-xs uppercase tracking-widest">{client.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2.5 bg-nexa-gold text-nexa-black rounded-xl font-bold hover:bg-nexa-goldHover transition-all shadow-lg shadow-nexa-gold/20 hover:scale-105 active:scale-95"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print Document</span>
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 rounded-xl transition-all"
                title="Close Preview"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
        </div>

        {/* منطقة العرض القابلة للتمرير */}
        <div className="flex-1 w-full overflow-y-auto p-4 md:p-12 flex justify-center items-start print:static print:p-0 print:overflow-visible">
            {/* حاوية الورقة المصممة بعناية */}
            <div className="bg-white text-black w-full max-w-[850px] min-h-[1100px] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative flex flex-col print:shadow-none print:w-[210mm] print:min-h-0 print-content border-t-[12px] border-nexa-gold">
              
              {/* محتوى المستند الفعلي */}
              <div className="p-8 md:p-16 flex-1 flex flex-col relative" dir={dir}>
                
                {/* علامة مائية خلفية هادئة */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                  <h1 className="text-[120px] font-black -rotate-45 uppercase select-none">Nexa Digital</h1>
                </div>

                {/* رأس المستند (Branding & Identity) */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 bg-nexa-black flex items-center justify-center rounded-2xl shadow-xl rotate-3">
                      <span className="text-nexa-gold text-4xl font-black">N</span>
                    </div>
                    <div>
                      <h1 className="text-3xl font-black uppercase tracking-tighter text-nexa-black leading-none mb-1">Nexa Digital</h1>
                      <p className="text-xs text-nexa-gold font-bold tracking-[0.3em] uppercase">Creative Tech Studio</p>
                      <div className="h-1 w-12 bg-nexa-gold mt-2"></div>
                    </div>
                  </div>

                  <div className="text-right rtl:text-left">
                    <h2 className="text-3xl font-black text-nexa-black mb-2 uppercase tracking-tight">{t('invoice_title')}</h2>
                    <div className="flex flex-col gap-1 text-sm font-medium">
                      <div className="flex justify-end rtl:justify-start gap-3 border-b border-gray-100 pb-1">
                        <span className="text-gray-400 uppercase tracking-widest text-[10px]">{t('invoice_date')}</span>
                        <span className="text-nexa-black">{formatDate(new Date())}</span>
                      </div>
                      <div className="flex justify-end rtl:justify-start gap-3">
                        <span className="text-gray-400 uppercase tracking-widest text-[10px]">Reference</span>
                        <span className="text-nexa-black font-mono">#{client.id.substring(0, 8).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 relative z-10">
                  {/* معلومات العميل (Bill To) */}
                  <div className="bg-gray-50 p-6 rounded-2xl border-l-4 border-nexa-gold">
                    <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-[0.2em]">{t('invoice_to')}</h3>
                    <div className="space-y-1">
                      <p className="text-2xl font-black text-nexa-black">{client.name}</p>
                      <p className="text-gray-500 font-medium">{client.industry || 'Exclusive Client'}</p>
                      {client.phone && (
                        <div className="flex items-center gap-2 mt-4 text-gray-700 font-mono text-sm bg-white px-3 py-1 rounded-lg w-fit shadow-sm border border-gray-100">
                          <span className="h-2 w-2 rounded-full bg-nexa-gold"></span>
                          {client.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* حالة الدفع الإجمالية المحسنة */}
                  <div className="flex flex-col items-center md:items-end justify-center">
                     <h3 className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-[0.2em]">{t('payment_status')}</h3>
                     <div className={`group relative flex flex-col items-center gap-1 px-8 py-4 rounded-2xl font-black transition-all ${
                       isFullyPaid ? 'bg-green-50 text-green-700 ring-2 ring-green-100' : 
                       isUnpaid ? 'bg-red-50 text-red-700 ring-2 ring-red-100' : 
                       'bg-nexa-gold/5 text-nexa-gold ring-2 ring-nexa-gold/10'
                     }`}>
                       <div className="flex items-center gap-3 text-xl">
                          {isFullyPaid ? <CheckCircle2 className="h-6 w-6" /> : 
                           isUnpaid ? <AlertCircle className="h-6 w-6" /> : 
                           <Clock className="h-6 w-6" />}
                          {isFullyPaid ? t('fully_paid') : 
                           isUnpaid ? t('unpaid') : 
                           t('partially_paid')}
                       </div>
                       <div className="h-1 w-full bg-current opacity-20 rounded-full mt-2"></div>
                     </div>
                  </div>
                </div>

                {/* الجدول المالي - تصميم عصري */}
                <div className="mb-16 relative z-10 overflow-hidden rounded-2xl border border-gray-100 shadow-sm">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-nexa-black text-white uppercase text-xs font-black tracking-widest text-center">
                        <th className="px-8 py-5 text-left rtl:text-right">{t('financials')}</th>
                        <th className="px-8 py-5 text-right rtl:text-left">Valuation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="group hover:bg-gray-50 transition-colors">
                        <td className="px-8 py-8">
                          <div className="font-black text-xl text-nexa-black">{t('total_quoted')}</div>
                          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Total Project Value Agreed</p>
                        </td>
                        <td className="px-8 py-8 text-right rtl:text-left text-2xl font-black text-nexa-black">
                          {formatAmount(client.priceQuoted)}
                        </td>
                      </tr>
                      <tr className="bg-green-50/30 group hover:bg-green-50 transition-colors">
                        <td className="px-8 py-8">
                          <div className="font-black text-xl text-green-700">{t('total_paid')}</div>
                          <p className="text-xs text-green-600/60 mt-1 uppercase tracking-wider">Cumulative Successful Payments</p>
                        </td>
                        <td className="px-8 py-8 text-right rtl:text-left text-2xl font-black text-green-700">
                          - {formatAmount(client.amountPaid)}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-nexa-black text-white">
                        <td className="px-8 py-10">
                          <div className="text-2xl font-black uppercase tracking-tighter">{t('balance_due')}</div>
                          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Amount Remaining for Settlement</p>
                        </td>
                        <td className="px-8 py-10 text-right rtl:text-left">
                          <div className="text-4xl font-black text-white mb-1">
                            {formatAmount(balance)}
                          </div>
                          <div className="h-1 w-32 bg-nexa-gold ml-auto rtl:mr-auto rounded-full"></div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* سجل الدفع - تصميم منمق */}
                {client.payments && client.payments.length > 0 && (
                    <div className="mb-16 relative z-10">
                      <div className="flex items-center gap-4 mb-6">
                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-[0.3em]">Payment Archives</h3>
                        <div className="h-px bg-gray-100 flex-1"></div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {client.payments.map((p: any, idx: number) => (
                              <div key={idx} className="flex flex-col p-4 border border-gray-100 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Batch #{client.payments!.length - idx}</span>
                                    <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-0.5 rounded-md uppercase">Verified</span>
                                  </div>
                                  <div className="flex justify-between items-end">
                                    <span className="font-bold text-nexa-black">{formatDate(new Date(p.date))}</span>
                                    <span className="text-lg font-black text-green-600">+{formatAmount(p.amount)}</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                    </div>
                )}

                {/* ذيل المستند (Footer & Integrity) */}
                <div className="mt-auto pt-16 border-t border-gray-100 relative z-10">
                  <div className="flex flex-col md:flex-row justify-between items-end gap-12">
                    <div className="max-w-[300px]">
                        <div className="flex items-center gap-2 mb-3 grayscale">
                          <ShieldCheck className="h-4 w-4 text-nexa-black" />
                          <span className="text-[10px] font-black uppercase tracking-widest">Official Verification</span>
                        </div>
                        <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-wider">
                          This document is a generated financial summary reflecting the current state of accounts for {client.name}. 
                          The integrity of this record is maintained by Nexa Digital CMS.
                        </p>
                    </div>
                    
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-56 h-28 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center relative overflow-hidden group">
                         <div className="absolute inset-0 bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                         <span className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.2em] relative z-10">Authorized Signature</span>
                         {/* مساحة الختم أو التوقيع */}
                         <div className="absolute bottom-2 right-2 h-16 w-16 border-2 border-nexa-gold/20 rounded-full flex items-center justify-center -rotate-12">
                            <span className="text-[8px] font-black text-nexa-gold/30 uppercase text-center">Official<br/>Stamp</span>
                         </div>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-nexa-black uppercase text-sm">{t('authorized_signature')}</p>
                        <p className="text-[10px] text-nexa-gold font-bold uppercase tracking-widest">Head of Operations</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-12 bg-nexa-black p-4 rounded-xl">
                     <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">© {new Date().getFullYear()} Nexa Digital Inc. All Rights Reserved.</p>
                     <div className="flex gap-4">
                        <span className="w-2 h-2 rounded-full bg-nexa-gold animate-pulse"></span>
                        <span className="w-2 h-2 rounded-full bg-white/20"></span>
                        <span className="w-2 h-2 rounded-full bg-white/40"></span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-white border-2 border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95 group shadow-lg hover:shadow-nexa-gold/10"
      >
        <Printer className="h-4 w-4 text-nexa-gold group-hover:scale-110 transition-transform" />
        <span className="group-hover:text-nexa-gold transition-colors">{t('generate_invoice')}</span>
      </button>

      {isOpen && mounted && createPortal(
        <div className="invoice-print-wrapper">
          {invoiceContent}
          <style jsx global>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              .invoice-print-wrapper, .invoice-print-wrapper * {
                visibility: visible !important;
              }
              .invoice-print-wrapper {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 0 !important;
                background: white !important;
              }
              /* Hide modal backgrounds and buttons during actual print */
              .bg-black\/80, .print\:hidden, .bg-nexa-black {
                display: none !important;
              }
              .print-content {
                position: static !important;
                margin: 0 auto !important;
                box-shadow: none !important;
                border-top: none !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `}</style>
        </div>, 
        document.body
      )}
    </>
  )
}
