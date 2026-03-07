'use client'

import Link from 'next/link'
import { LayoutDashboard, TrendingUp, ArrowLeft } from 'lucide-react'

export default function AdminAnalyticsPage() {
  return (
    <div
      className="min-h-screen text-white flex flex-col items-center justify-center p-6"
      style={{ background: 'var(--slate-950)' }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-64 rounded-full bg-[var(--gold)]/8 blur-3xl" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="glass-panel rounded-2xl p-8 text-center border border-white/10">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-[var(--gold)]/15 border border-[var(--gold)]/30 flex items-center justify-center mb-6 shadow-lg shadow-[var(--gold)]/10">
            <TrendingUp className="h-8 w-8 text-[var(--gold)]" />
          </div>

          <h1 className="text-2xl font-bold text-white mb-3">Analytics Dashboard</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Detailed analytics are coming soon. Full reporting, revenue trends,
            and client activity charts will be available here.
          </p>

          <Link
            href="/admin"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-200
              bg-[var(--gold)] text-[var(--slate-950)] hover:brightness-110 shadow-md hover:shadow-[var(--gold)]/30"
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
