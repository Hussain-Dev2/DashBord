'use client'

import React, { useState, useRef, useEffect } from 'react'
import { X, MessageCircle, Sparkles, ChevronDown, RefreshCw, RotateCcw } from 'lucide-react'

// ─── FAQ definitions ────────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    id: 'add-client',
    question: '➕ How do I add a client?',
    answer: `Tap the gold **"Add Client"** button at the top-right (or the ✚ button on mobile). Fill in the name, phone, and financial details. You can also set a logo and add custom fields in the Advanced section!`,
  },
  {
    id: 'real-data',
    question: '🧪 Is this data real?',
    answer: `Nope! In Demo Mode, all the clients and numbers are sample data so you can explore freely without breaking anything. Sign in with an admin account to manage real client data synced to the cloud.`,
  },
  {
    id: 'payments',
    question: '💰 How are payments tracked?',
    answer: `Each client has a **Price Quoted** and **Amount Paid**. The difference is their outstanding balance. You can log new payments at any time from the client detail view. A progress bar shows how close they are to full payment.`,
  },
  {
    id: 'admin',
    question: '🔐 How do I get admin access?',
    answer: `Click **Sign In** in the header (or the login icon on mobile). Admin access gives you real cloud sync, persistent data across devices, and full analytics. Contact your administrator for credentials.`,
  },
  {
    id: 'currencies',
    question: '💱 Can I switch currencies?',
    answer: `Yes! Use the **currency selector** in the header to switch between USD and IQD. Amounts are converted automatically using live exchange rates.`,
  },
  {
    id: 'invoice',
    question: '📄 Can I generate invoices?',
    answer: `Absolutely. Open any client's detail view and click **"Generate Invoice"**. You'll get a professional PDF-ready invoice including all payment history. You can share it or download it directly.`,
  },
]

// ─── Types ───────────────────────────────────────────────────────────────────
interface Message {
  id: string
  type: 'question' | 'answer'
  content: string
  faqId?: string
}

// ─── Helper: parse bold **text** in answers ──────────────────────────────────
function ParsedText({ text }: { text: string }) {
  const parts = text.split(/\*\*(.*?)\*\*/g)
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={i} className="text-amber-400 font-black">{part}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────
export function DemoChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [showFaq, setShowFaq] = useState(true)
  const [hasUnread, setHasUnread] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Show unread badge after a delay on first load
  useEffect(() => {
    const shown = sessionStorage.getItem('demoChatIntroShown')
    if (!shown) {
      const t = setTimeout(() => {
        setHasUnread(true)
        sessionStorage.setItem('demoChatIntroShown', '1')
      }, 5000)
      return () => clearTimeout(t)
    }
  }, [])

  useEffect(() => {
    if (isOpen) setHasUnread(false)
  }, [isOpen])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const handleFaqClick = (faq: typeof FAQ_ITEMS[0]) => {
    setShowFaq(false)
    const qMsg: Message = { id: `q-${Date.now()}`, type: 'question', content: faq.question, faqId: faq.id }
    setMessages(prev => [...prev, qMsg])

    // Simulate a short typing delay
    setTimeout(() => {
      const aMsg: Message = { id: `a-${Date.now()}`, type: 'answer', content: faq.answer, faqId: faq.id }
      setMessages(prev => [...prev, aMsg])
    }, 600)
  }

  const handleReset = () => {
    setMessages([])
    setShowFaq(true)
  }

  // Restart tour (restores DemoWelcome session flag)
  const handleRestartTour = () => {
    sessionStorage.removeItem('demoWelcomeShown')
    setIsOpen(false)
    window.location.reload()
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-24 md:bottom-6 end-4 md:end-6 z-[90]">
        <div className="relative">
          {hasUnread && !isOpen && (
            <div className="absolute -top-1 -end-1 h-4 w-4 bg-amber-400 rounded-full border-2 border-[#0d0f1a] animate-bounce z-10 flex items-center justify-center">
              <span className="text-[8px] font-black text-slate-950">1</span>
            </div>
          )}
          <button
            onClick={() => setIsOpen(o => !o)}
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 active:scale-90 hover:scale-110 shadow-2xl shadow-amber-500/20"
            style={{ background: isOpen ? '#1e2035' : 'linear-gradient(135deg, #F59E0B, #D97706)', border: '2px solid rgba(245,158,11,0.3)' }}
            aria-label="Open help chat"
          >
            {isOpen ? (
              <ChevronDown className="h-6 w-6 text-amber-400" />
            ) : (
              <Sparkles className="h-6 w-6 text-slate-950" />
            )}
          </button>
        </div>
      </div>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-40 md:bottom-24 end-4 md:end-6 z-[89] w-[calc(100vw-2rem)] max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Glow */}
          <div className="absolute -inset-px rounded-3xl bg-gradient-to-br from-amber-400/10 via-transparent to-transparent blur-sm pointer-events-none" />
          
          <div className="relative bg-[#0d0f1a] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="relative h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                <Sparkles className="h-4 w-4 text-slate-950" />
                <div className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-green-400 border-2 border-[#0d0f1a]" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-white">Nexa Assistant</p>
                <p className="text-[10px] text-green-400 font-bold">Online — always here to help</p>
              </div>
              <div className="flex items-center gap-2">
                {messages.length > 0 && (
                  <button
                    onClick={handleReset}
                    className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-600 hover:text-gray-300 transition-all"
                    title="Start over"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-600 hover:text-white transition-all group"
                >
                  <X className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div ref={scrollRef} className="max-h-72 overflow-y-auto p-4 space-y-3 scrollbar-hide">
              {/* Initial Greeting */}
              {messages.length === 0 && (
                <div className="flex gap-2.5 items-start">
                  <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                  </div>
                  <div className="flex-1 bg-white/[0.04] border border-white/5 rounded-2xl rounded-tl-sm px-4 py-3">
                    <p className="text-sm text-gray-300 leading-relaxed">
                      Hi! 👋 I'm Nexa. Pick a question below and I'll answer it instantly!
                    </p>
                  </div>
                </div>
              )}

              {/* Message thread */}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex gap-2.5 items-end animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.type === 'question' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {msg.type === 'answer' && (
                    <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center shrink-0">
                      <Sparkles className="h-3.5 w-3.5 text-slate-950" />
                    </div>
                  )}
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    msg.type === 'question'
                      ? 'bg-amber-500/15 border border-amber-500/20 text-amber-100 rounded-br-sm font-medium'
                      : 'bg-white/[0.04] border border-white/5 text-gray-300 rounded-bl-sm'
                  }`}>
                    {msg.type === 'answer' ? <ParsedText text={msg.content} /> : msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* FAQ Selector or Ask More */}
            <div className="px-4 pb-4 space-y-2">
              {showFaq ? (
                <div className="space-y-1.5">
                  <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest px-1 mb-2">Common Questions</p>
                  {FAQ_ITEMS.map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => handleFaqClick(faq)}
                      className="w-full text-start px-4 py-2.5 rounded-2xl bg-white/[0.03] border border-white/5 text-sm text-gray-300 hover:bg-white/[0.07] hover:text-white hover:border-amber-500/20 transition-all font-medium"
                    >
                      {faq.question}
                    </button>
                  ))}
                  <button
                    onClick={handleRestartTour}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400 hover:bg-amber-500/20 transition-all font-bold"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Restart the App Tour
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowFaq(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.03] border border-white/5 text-sm text-gray-400 hover:bg-white/[0.07] hover:text-white transition-all font-bold"
                >
                  <MessageCircle className="h-4 w-4" />
                  Ask another question
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
