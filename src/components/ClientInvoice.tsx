'use client'

// استيراد أدوات React والأيقونات والسياقات
// Import React tools, icons, and contexts
import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Printer, X, FileText, CheckCircle2, AlertCircle, Clock, ShieldCheck, Image as ImageIcon } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { SerializedClient } from '@/lib/types'
import { formatDate } from '@/lib/format'
import html2canvas from 'html2canvas'
import { toast } from 'sonner'

// مكون كشف الحساب المالي القابل للطباعة - نسخة محسنة بريميوم
// Premium Printable Statement of Account (Invoice) Component
export function ClientInvoice({ client }: { client: SerializedClient }) {
  const { t, language, dir } = useLanguage() // بيانات اللغة والترجمة
  const { formatAmount } = useCurrency() // تنسيق المبالغ المالية
  const [isOpen, setIsOpen] = useState(false) // حالة فتح نافذة المعاينة
  const [mounted, setMounted] = useState(false) // حالة تركيب المكون
  const [isCapturing, setIsCapturing] = useState(false) // حالة التقاط الصورة
  const invoiceRef = useRef<HTMLDivElement>(null) // مرجع لمحتوى الفاتورة

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

  // دالة تحويل الفاتورة إلى صورة باستخدام html2canvas
  const captureImage = async () => {
    if (!invoiceRef.current) return null;
    try {
      setIsCapturing(true);
      
      // إعدادات التقاط الصورة بجودة عالية
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, // جودة مضاعفة
        useCORS: true, 
        backgroundColor: '#ffffff',
        logging: false,
        onclone: (document) => {
          // يمكننا تعديل العناصر في النسخة المستنسخة قبل التصوير إذا لزم الأمر
        }
      });
      
      const dataUrl = canvas.toDataURL('image/png');
      setIsCapturing(false);
      return dataUrl;
    } catch (err) {
      console.error('Snapshot error:', err);
      setIsCapturing(false);
      toast.error('Failed to generate image');
      return null;
    }
  }

  // مشاركة الصورة والرسالة عبر الواتساب
  const handleWhatsAppShare = async () => {
    toast.info(language === 'ar' ? 'جاري تحضير الفاتورة والمشاركة...' : 'Preparing invoice and sharing...');
    
    // 1. تحضير الرسالة النصية
    const message = language === 'ar' 
      ? `مرحباً ${client.name}، إليكم ملخص كشف الحساب من Nexa Digital:\n\n` +
        `• إجمالي المتفق عليه: ${formatAmount(client.priceQuoted)}\n` +
        `• إجمالي المدفوع: ${formatAmount(client.amountPaid)}\n` +
        `• المبلغ المتبقي: ${formatAmount(balance)}\n\n` +
        `حالة الدفع: ${isFullyPaid ? 'مدفوع بالكامل' : isUnpaid ? 'غير مدفوع' : 'مدفوع جزئياً'}\n\n` +
        `شكراً لتعاملكم معنا!`
      : `Hello ${client.name}, here is your statement summary from Nexa Digital:\n\n` +
        `• Total Quoted: ${formatAmount(client.priceQuoted)}\n` +
        `• Total Paid: ${formatAmount(client.amountPaid)}\n` +
        `• Balance Due: ${formatAmount(balance)}\n\n` +
        `Status: ${isFullyPaid ? 'Fully Paid' : isUnpaid ? 'Unpaid' : 'Partially Paid'}\n\n` +
        `Thank you for your business!`;

    // 2. إنشاء الصورة وتنزيلها
    const dataUrl = await captureImage();
    if (dataUrl) {
        const link = document.createElement('a');
        link.download = `Invoice-${client.name}.png`;
        link.href = dataUrl;
        link.click();
        
        toast.success(language === 'ar' 
          ? 'تم تنزيل الصورة! يرجى إرفاقها في الواتساب الآن.' 
          : 'Image downloaded! Please attach it to WhatsApp now.');
    }

    // 3. فتح الواتساب
    setTimeout(() => {
        const encodedMessage = encodeURIComponent(message);
        const phoneNumber = client.phone ? client.phone.replace(/[^0-9]/g, '') : '';
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
    }, 1000);
  }

  const handleDownloadImage = async () => {
    const dataUrl = await captureImage();
    if (dataUrl) {
      const link = document.createElement('a');
      link.download = `Invoice-${client.name}.png`;
      link.href = dataUrl;
      link.click();
      toast.success('Saved as PNG');
    }
  }

  // محتوى كشف الحساب
  const invoiceContent = (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 overflow-hidden print:static print:bg-white print:p-0 invoice-overlay">
      
      {/* حاوية المعاينة (Modal Holder) */}
      <div className="bg-nexa-black border border-white/10 w-full max-w-[950px] max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative print:static print:p-0 print:border-none print:shadow-none print:w-full print:max-h-none print:rounded-none invoice-modal">
        
        {/* شريط التحكم العلوي */}
        <div className="w-full bg-white/5 border-b border-white/10 p-4 flex justify-between items-center z-[10001] print:hidden">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-nexa-gold/20 flex items-center justify-center">
                <FileText className="h-5 w-5 text-nexa-gold" />
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-bold block leading-none">{t('invoice_title')}</span>
                <span className="text-gray-500 text-xs uppercase tracking-widest">{client.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <button 
                onClick={handleDownloadImage}
                disabled={isCapturing}
                className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white border border-white/10 rounded-xl font-bold hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
              >
                <ImageIcon className="h-4 w-4 text-nexa-gold" />
                <span className="hidden lg:inline">Image</span>
              </button>
              <button 
                onClick={handleWhatsAppShare}
                disabled={isCapturing}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-xl font-bold hover:bg-[#25D366]/20 transition-all active:scale-95 disabled:opacity-50"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.064-4.516 10.066-10.066.002-2.686-1.047-5.212-2.952-7.115-1.907-1.903-4.432-2.952-7.118-2.953-5.556 0-10.069 4.513-10.071 10.069-.001 2.105.549 4.158 1.593 5.969l-1.011 3.693 3.79-1.011c.001 0 .001 0 0 0zm11.367-7.635c-.31-.155-1.839-.906-2.126-1.01-.288-.104-.499-.155-.708.156-.208.311-.807 1.011-1.01 1.243-.203.232-.406.259-.716.104-.31-.155-1.31-.484-2.492-1.541-.92-.818-1.543-1.834-1.723-2.145-.181-.311-.019-.479.135-.633.139-.138.31-.358.466-.538.156-.181.208-.311.312-.518.104-.208.052-.389-.026-.544-.078-.155-.708-1.708-.971-2.339-.256-.613-.516-.531-.709-.541-.183-.009-.395-.011-.606-.011-.211 0-.554.08-.846.39-.292.311-1.115 1.09-1.115 2.659 0 1.571 1.144 3.088 1.303 3.303.158.216 2.251 3.44 5.452 4.823.761.328 1.355.524 1.82.669.764.243 1.458.209 2.008.127.613-.092 1.839-.751 2.099-1.477.26-.725.26-1.348.182-1.477-.078-.13-.288-.208-.598-.363z"/></svg>
                <span className="hidden md:inline">WhatsApp</span>
              </button>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-6 py-2.5 bg-nexa-gold text-nexa-black rounded-xl font-bold hover:bg-nexa-goldHover transition-all shadow-lg shadow-nexa-gold/20 active:scale-95"
              >
                <Printer className="h-4 w-4" />
                <span className="hidden sm:inline">Print Document</span>
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 rounded-xl transition-all"
                title="Close"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
        </div>

        {/* منطقة العرض */}
        <div className="flex-1 w-full overflow-y-auto p-4 md:p-8 flex justify-center items-start print:static print:p-0 print:overflow-visible">
            {/* حاوية الفاتورة */}
            <div id="printable-area" ref={invoiceRef} className="bg-white text-black w-full max-w-[850px] min-h-[1100px] shadow-[0_0_100px_rgba(0,0,0,0.5)] relative flex flex-col print:shadow-none print:w-full print:min-h-0 border-t-[12px] border-nexa-gold">
              
              <div className="p-8 md:p-12 flex-1 flex flex-col relative" dir={dir}>
                
                {/* علامة مائية */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
                  <h1 className="text-[100px] font-black -rotate-45 uppercase select-none">Nexa Digital</h1>
                </div>

                {/* الرأس */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6 relative z-10 print:mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 bg-nexa-black flex items-center justify-center rounded-2xl shadow-xl rotate-3 print:bg-black print:h-12 print:w-12">
                      <span className="text-nexa-gold text-3xl font-black print:text-2xl">N</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-black uppercase tracking-tighter text-nexa-black leading-none mb-1">Nexa Digital</h1>
                      <p className="text-[10px] text-nexa-gold font-bold tracking-[0.2em] uppercase">Creative Tech Studio</p>
                    </div>
                  </div>

                  <div className="text-right rtl:text-left">
                    <h2 className="text-2xl font-black text-nexa-black mb-1 uppercase tracking-tight">{t('invoice_title')}</h2>
                    <div className="flex flex-col gap-0.5 text-xs font-medium">
                      <div className="flex justify-end rtl:justify-start gap-2">
                        <span className="text-gray-400 uppercase tracking-widest text-[9px]">{t('invoice_date')}</span>
                        <span className="text-nexa-black">{formatDate(new Date())}</span>
                      </div>
                      <div className="flex justify-end rtl:justify-start gap-2">
                        <span className="text-gray-400 uppercase tracking-widest text-[9px]">Ref</span>
                        <span className="text-nexa-black font-mono">#{client.id.substring(0, 8).toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 relative z-10 print:mb-4">
                  {/* معلومات العميل */}
                  <div className="bg-gray-50 p-5 rounded-xl border-l-4 border-nexa-gold print:p-3">
                    <h3 className="text-[9px] font-black uppercase text-gray-400 mb-2 tracking-[0.2em]">{t('invoice_to')}</h3>
                    <div className="space-y-0.5">
                      <p className="text-xl font-black text-nexa-black">{client.name}</p>
                      <p className="text-xs text-gray-500 font-medium">{client.industry || 'Exclusive Client'}</p>
                      {client.phone && (
                        <p className="text-xs text-gray-700 font-mono mt-2">{client.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* الحالة */}
                  <div className="flex flex-col items-center md:items-end justify-center">
                     <div className={`px-6 py-3 rounded-xl font-black text-sm print:py-2 ${
                       isFullyPaid ? 'bg-green-50 text-green-700' : 
                       isUnpaid ? 'bg-red-50 text-red-700' : 
                       'bg-nexa-gold/5 text-nexa-gold'
                     }`}>
                       {isFullyPaid ? t('fully_paid') : isUnpaid ? t('unpaid') : t('partially_paid')}
                     </div>
                  </div>
                </div>

                {/* الجدول */}
                <div className="mb-8 relative z-10 overflow-hidden rounded-xl border border-gray-100 print:mb-4">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-nexa-black text-white uppercase text-[10px] font-black tracking-widest text-center print:bg-black">
                        <th className="px-6 py-3 text-left rtl:text-right">{t('financials')}</th>
                        <th className="px-6 py-3 text-right rtl:text-left">Value</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr>
                        <td className="px-6 py-4">
                          <div className="font-bold text-base text-nexa-black">{t('total_quoted')}</div>
                        </td>
                        <td className="px-6 py-4 text-right rtl:text-left text-lg font-black text-nexa-black">
                          {formatAmount(client.priceQuoted)}
                        </td>
                      </tr>
                      <tr className="bg-green-50/20">
                        <td className="px-6 py-4">
                          <div className="font-bold text-base text-green-700">{t('total_paid')}</div>
                        </td>
                        <td className="px-6 py-4 text-right rtl:text-left text-lg font-black text-green-700">
                          - {formatAmount(client.amountPaid)}
                        </td>
                      </tr>
                    </tbody>
                    <tfoot>
                      <tr className="bg-nexa-black text-white print:bg-black">
                        <td className="px-6 py-6">
                          <div className="text-lg font-black uppercase tracking-tighter">{t('balance_due')}</div>
                        </td>
                        <td className="px-6 py-6 text-right rtl:text-left">
                          <div className="text-2xl font-black text-white">
                            {formatAmount(balance)}
                          </div>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* المدفوعات */}
                {client.payments && client.payments.length > 0 && (
                    <div className="mb-8 relative z-10 print:mb-4">
                      <h3 className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] mb-3">Recent Payments</h3>
                      <div className="grid grid-cols-2 gap-3">
                          {client.payments.slice(-4).map((p: any, idx: number) => (
                              <div key={idx} className="flex justify-between p-3 border border-gray-100 rounded-lg bg-white text-xs">
                                <span className="font-medium text-gray-500">{formatDate(new Date(p.date))}</span>
                                <span className="font-black text-green-600">+{formatAmount(p.amount)}</span>
                              </div>
                          ))}
                      </div>
                    </div>
                )}

                {/* التوقيع */}
                <div className="mt-auto pt-8 border-t border-gray-100 relative z-10 flex justify-between items-end">
                  <div className="max-w-[250px]">
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider leading-tight">
                        Generated by Nexa Digital CMS. Official financial summary.
                      </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-40 h-16 border-2 border-dashed border-gray-100 rounded-xl mb-2 flex items-center justify-center relative">
                       <span className="text-[8px] text-gray-200 font-bold uppercase tracking-widest">Authorized</span>
                       <div className="absolute bottom-1 right-1 h-10 w-10 border border-nexa-gold/10 rounded-full flex items-center justify-center rotate-12">
                          <span className="text-[5px] font-black text-nexa-gold/20 uppercase">STAMP</span>
                       </div>
                    </div>
                    <p className="font-bold text-nexa-black text-xs uppercase">{t('authorized_signature')}</p>
                  </div>
                </div>

                <div className="mt-6 bg-nexa-black p-3 rounded-lg print:bg-black print:mt-4 print:p-2">
                   <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest text-center">© {new Date().getFullYear()} Nexa Digital Inc.</p>
                </div>
              </div>
            </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { size: a4; margin: 0; }
          body { visibility: hidden !important; background: white !important; margin: 0; padding: 0; }
          .invoice-root, .invoice-root * { visibility: visible !important; }
          .invoice-root { 
            position: absolute !important; left: 0; top: 0; 
            width: 210mm !important; height: 297mm !important; 
            z-index: 99999; overflow: hidden; 
          }
          .invoice-overlay, .invoice-modal { 
            position: static !important; background: white !important; 
            border: none; box-shadow: none; display: block; 
            width: 100%; height: 100%; 
          }
          #printable-area { 
            width: 100% !important; height: 100% !important; 
            border-top: 8pt solid #D4AF37 !important; 
          }
          .print\:hidden { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
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
        <div className="invoice-root">
          {invoiceContent}
        </div>, 
        document.body
      )}
    </>
  )
}
