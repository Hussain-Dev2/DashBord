'use client'

import React, { useState, useEffect } from 'react'
import {
  X, ChevronRight, ChevronLeft, Sparkles, Users, DollarSign, 
  FileText, BarChart2, Shield, Zap, Star, ArrowRight, Compass
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

// ─── Bilingual tour slides ────────────────────────────────────────────────────
const TOUR_SLIDES = {
  en: [
    {
      id: 1, icon: BarChart2, color: '#F59E0B', gradient: 'from-amber-500/20 to-yellow-600/5',
      label: 'Live Dashboard', title: 'Everything at a Glance',
      body: `Your dashboard shows real-time stats across all clients — total revenue collected, outstanding balances, and active project counts. No more digging through spreadsheets.`,
      highlight: '4 live stat cards, always up-to-date',
    },
    {
      id: 2, icon: Users, color: '#60A5FA', gradient: 'from-blue-500/20 to-indigo-600/5',
      label: 'Client Management', title: 'Add, Edit & Organize Clients',
      body: `Create client profiles with a logo, phone number, and financial details in seconds. Track their project status — Active, Completed, or Paused — and see everything in one place.`,
      highlight: 'Custom fields + logo upload support',
    },
    {
      id: 3, icon: DollarSign, color: '#34D399', gradient: 'from-emerald-500/20 to-green-600/5',
      label: 'Financials', title: 'Payment & Debt Tracking',
      body: `Log payments, track outstanding balances, and instantly see who still owes you money. The progress bar on each client card shows how close they are to finishing the full payment.`,
      highlight: 'USD & IQD support with live conversion',
    },
    {
      id: 4, icon: FileText, color: '#A78BFA', gradient: 'from-violet-500/20 to-purple-600/5',
      label: 'Invoices', title: 'Professional Invoices',
      body: `Generate polished invoices for any client with a single click. Download them as PDFs or share a link directly. Full payment history is included automatically.`,
      highlight: 'PDF-ready, branded with your details',
    },
    {
      id: 5, icon: Shield, color: '#F87171', gradient: 'from-red-500/20 to-rose-600/5',
      label: 'Admin Access', title: 'Demo vs Admin Mode',
      body: `You're currently in Demo Mode — you can explore freely with sample data. When you're ready, sign in with your admin credentials to sync real clients, payments, and invoices to the cloud.`,
      highlight: 'Your data stays yours, always encrypted',
    },
  ],
  ar: [
    {
      id: 1, icon: BarChart2, color: '#F59E0B', gradient: 'from-amber-500/20 to-yellow-600/5',
      label: 'لوحة التحكم المباشرة', title: 'كل شيء في لمحة واحدة',
      body: `تعرض لوحة التحكم إحصاءات فورية لجميع عملائك — إجمالي الإيرادات المحصّلة، الأرصدة المستحقة، وعدد المشاريع النشطة. لا مزيد من البحث في جداول البيانات.`,
      highlight: '٤ بطاقات إحصائية حية دائماً',
    },
    {
      id: 2, icon: Users, color: '#60A5FA', gradient: 'from-blue-500/20 to-indigo-600/5',
      label: 'إدارة العملاء', title: 'إضافة وتعديل وتنظيم العملاء',
      body: `أنشئ ملفات عملاء بشعار ورقم هاتف وتفاصيل مالية في ثوانٍ. تتبع حالة مشروعهم — نشط، مكتمل، أو موقوف — وشاهد كل شيء في مكان واحد.`,
      highlight: 'حقول مخصصة + رفع الشعار',
    },
    {
      id: 3, icon: DollarSign, color: '#34D399', gradient: 'from-emerald-500/20 to-green-600/5',
      label: 'الشؤون المالية', title: 'تتبع المدفوعات والديون',
      body: `سجّل المدفوعات وتابع الأرصدة المستحقة واعرف فوراً من لا يزال مديناً لك. يُظهر شريط التقدم على كل بطاقة عميل مدى اقترابه من السداد الكامل.`,
      highlight: 'دعم الدولار والدينار مع تحويل مباشر',
    },
    {
      id: 4, icon: FileText, color: '#A78BFA', gradient: 'from-violet-500/20 to-purple-600/5',
      label: 'الفواتير', title: 'فواتير احترافية',
      body: `أنشئ فواتير أنيقة لأي عميل بنقرة واحدة. نزّلها كـ PDF أو شاركها مباشرةً. سجل المدفوعات الكامل مُدرج تلقائياً.`,
      highlight: 'جاهزة للطباعة ومعلّمة ببياناتك',
    },
    {
      id: 5, icon: Shield, color: '#F87171', gradient: 'from-red-500/20 to-rose-600/5',
      label: 'صلاحية المشرف', title: 'وضع التجربة مقابل وضع المشرف',
      body: `أنت حالياً في وضع التجربة — يمكنك الاستكشاف بحرية مع بيانات نموذجية. عندما تكون مستعداً، سجّل دخولك ببيانات المشرف لمزامنة العملاء والمدفوعات مع السحابة.`,
      highlight: 'بياناتك آمنة ومشفّرة دائماً',
    },
  ],
}

const UI_TEXT = {
  en: {
    agentTitle: 'Nexa',
    agentRole: 'Your App Guide',
    welcomeMsg: "Hey there! 👋 I'm Nexa, your guide. Welcome to DebtTrack — the smart way to manage clients and payments. Want a quick tour of what this app can do?",
    takeTour: 'Take the Tour',
    exploreSelf: 'Explore on my own',
    next: 'Next',
    back: 'Back',
    letsGo: "Let's Go!",
    byeTitle: 'Great! Have fun exploring 🎉',
    byeBody: 'Tap the chat bubble at the bottom-right anytime you need help.',
    chatHighlight: 'chat bubble',
    slideCounter: (i: number, total: number) => `${i} / ${total}`,
  },
  ar: {
    agentTitle: 'نيكسا',
    agentRole: 'مرشدتك في التطبيق',
    welcomeMsg: "مرحباً! 👋 أنا نيكسا، مرشدتك هنا. أهلاً بك في DebtTrack — الطريقة الذكية لإدارة العملاء والمدفوعات. هل تريد جولة سريعة لاكتشاف ما يقدمه هذا التطبيق؟",
    takeTour: 'ابدأ الجولة',
    exploreSelf: 'استكشف بنفسي',
    next: 'التالي',
    back: 'السابق',
    letsGo: 'هيّا نبدأ!',
    byeTitle: 'رائع! استمتع بالاستكشاف 🎉',
    byeBody: 'اضغط على فقاعة الدردشة في أسفل الشاشة في أي وقت تحتاج فيه مساعدة.',
    chatHighlight: 'فقاعة الدردشة',
    slideCounter: (i: number, total: number) => `${i} / ${total}`,
  },
}

// ─── Typed text animation hook ────────────────────────────────────────────────
function useTypedText(text: string, speed = 22, active = true) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active) return
    setDisplayed('')
    setDone(false)
    let i = 0
    const interval = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) { clearInterval(interval); setDone(true) }
    }, speed)
    return () => clearInterval(interval)
  }, [text, active])

  return { displayed, done }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DemoWelcome() {
  const { language } = useLanguage()
  const [phase, setPhase] = useState<'welcome' | 'tour' | 'bye'>('welcome')
  const [visible, setVisible] = useState(false)
  const [slideIndex, setSlideIndex] = useState(0)
  const [slideKey, setSlideKey] = useState(0)

  const isRTL = language === 'ar'
  const ui = UI_TEXT[language]
  const slides = TOUR_SLIDES[language]

  const { displayed: typedWelcome, done: welcomeDone } = useTypedText(ui.welcomeMsg, 20, phase === 'welcome' && visible)

  // Reset to welcome screen when language changes
  useEffect(() => {
    if (visible) {
      setPhase('welcome')
      setSlideIndex(0)
    }
  }, [language])

  // Show only once per session
  useEffect(() => {
    const shown = sessionStorage.getItem('demoWelcomeShown')
    if (!shown) {
      const timer = setTimeout(() => {
        setVisible(true)
        sessionStorage.setItem('demoWelcomeShown', '1')
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptTour = () => { setPhase('tour'); setSlideIndex(0) }
  const handleDecline = () => { setPhase('bye'); setTimeout(() => setVisible(false), 3000) }
  const handleClose = () => { setPhase('bye'); setTimeout(() => setVisible(false), 400) }

  const goNext = () => {
    if (slideIndex < slides.length - 1) { setSlideKey(k => k + 1); setSlideIndex(i => i + 1) }
    else handleClose()
  }
  const goPrev = () => {
    if (slideIndex > 0) { setSlideKey(k => k + 1); setSlideIndex(i => i - 1) }
  }

  if (!visible) return null

  const slide = slides[slideIndex]
  const SlideIcon = slide?.icon ?? Sparkles

  return (
    <div
      dir={isRTL ? 'rtl' : 'ltr'}
      className={`fixed inset-0 z-[100] flex items-end md:items-center justify-center p-4 transition-all duration-500 ${
        phase === 'bye' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md" onClick={handleClose} />

      {/* Card */}
      <div className="relative w-full max-w-lg z-10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-amber-400/20 via-transparent to-transparent blur-sm pointer-events-none" />

        <div className="relative bg-[#0d0f1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">

          {/* Top bar */}
          <div className="flex items-center gap-3 px-6 pt-6 pb-4 border-b border-white/5">
            <div className="flex items-center gap-2.5">
              <div className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Sparkles className="h-5 w-5 text-slate-950" />
                <div className="absolute -top-0.5 -end-0.5 h-3 w-3 rounded-full bg-green-400 border-2 border-[#0d0f1a]" />
              </div>
              <div>
                <p className="text-sm font-black text-white">{ui.agentTitle}</p>
                <p className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider">{ui.agentRole}</p>
              </div>
            </div>
            <div className="ms-auto flex items-center gap-3">
              {phase === 'tour' && (
                <span className="text-xs text-gray-500 font-bold tabular-nums">
                  {ui.slideCounter(slideIndex + 1, slides.length)}
                </span>
              )}
              <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all group">
                <X className="h-4 w-4 group-hover:rotate-90 transition-transform" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {phase === 'welcome' && (
              <div className="space-y-6">
                <div className="flex gap-3 items-start">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shrink-0 mt-1">
                    <Sparkles className="h-4 w-4 text-slate-950" />
                  </div>
                  <div className="flex-1 bg-white/[0.04] border border-white/5 rounded-2xl rounded-ss-sm px-5 py-4">
                    <p className="text-sm text-gray-200 leading-relaxed font-medium">
                      {typedWelcome}
                      {!welcomeDone && (
                        <span className="inline-block w-[3px] h-[14px] bg-amber-400 rounded-full ms-1 animate-pulse align-middle" />
                      )}
                    </p>
                  </div>
                </div>

                {welcomeDone && (
                  <div className="flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <button
                      onClick={handleAcceptTour}
                      className="flex-1 flex items-center justify-center gap-2 min-h-[52px] rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95"
                      style={{ background: 'linear-gradient(135deg, #F59E0B, #D97706)', color: '#0d0f1a' }}
                    >
                      <Zap className="h-4 w-4" />
                      {ui.takeTour}
                    </button>
                    <button
                      onClick={handleDecline}
                      className="flex-1 flex items-center justify-center gap-2 min-h-[52px] rounded-2xl font-bold text-sm text-gray-400 bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] hover:text-white transition-all active:scale-95"
                    >
                      <Compass className="h-4 w-4" />
                      {ui.exploreSelf}
                    </button>
                  </div>
                )}
              </div>
            )}

            {phase === 'tour' && slide && (
              <div key={slideKey} className="space-y-5 animate-in fade-in slide-in-from-end-8 duration-400">
                <div className={`flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-br ${slide.gradient} border border-white/5`}>
                  <div className="h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: `${slide.color}22`, border: `1px solid ${slide.color}44` }}>
                    <SlideIcon className="h-7 w-7" style={{ color: slide.color }} />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 block" style={{ color: slide.color }}>{slide.label}</span>
                    <h3 className="text-lg font-black text-white leading-tight">{slide.title}</h3>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                  </div>
                  <div className="flex-1 bg-white/[0.04] border border-white/5 rounded-2xl rounded-ss-sm px-4 py-3">
                    <p className="text-sm text-gray-300 leading-relaxed">{slide.body}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 shrink-0" style={{ color: slide.color }} />
                      <p className="text-xs font-bold" style={{ color: slide.color }}>{slide.highlight}</p>
                    </div>
                  </div>
                </div>

                {/* Progress dots */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => { setSlideKey(k => k+1); setSlideIndex(i) }}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width: i === slideIndex ? '24px' : '8px',
                        height: '8px',
                        background: i === slideIndex ? slide.color : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                  {slideIndex > 0 && (
                    <button onClick={goPrev} className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-sm font-bold text-gray-400 bg-white/[0.03] border border-white/5 hover:bg-white/[0.07] hover:text-white transition-all active:scale-95">
                      {isRTL ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                      {ui.back}
                    </button>
                  )}
                  <button
                    onClick={goNext}
                    className="flex-1 flex items-center justify-center gap-2 min-h-[52px] rounded-2xl font-black text-sm uppercase tracking-wider transition-all active:scale-95 hover:opacity-90"
                    style={{ background: `linear-gradient(135deg, ${slide.color}, ${slide.color}bb)`, color: '#0d0f1a' }}
                  >
                    {slideIndex < slides.length - 1 ? (
                      <>{ui.next} {isRTL ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</>
                    ) : (
                      <>{ui.letsGo} <ArrowRight className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} /></>
                    )}
                  </button>
                </div>
              </div>
            )}

            {phase === 'bye' && (
              <div className="text-center py-6 space-y-3 animate-in fade-in duration-300">
                <div className="h-14 w-14 mx-auto rounded-2xl bg-gradient-to-br from-amber-400/20 to-yellow-600/10 flex items-center justify-center">
                  <Sparkles className="h-7 w-7 text-amber-400" />
                </div>
                <p className="text-white font-black text-lg">{ui.byeTitle}</p>
                <p className="text-gray-500 text-sm">
                  {ui.byeBody.split(ui.chatHighlight)[0]}
                  <span className="text-amber-400 font-bold">{ui.chatHighlight}</span>
                  {ui.byeBody.split(ui.chatHighlight)[1]}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
