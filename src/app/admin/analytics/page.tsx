'use client'

import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'

export default function AdminAnalyticsPage() {
  return (
    <div className="min-h-screen bg-nexa-black text-white p-6 md:p-10 flex flex-col items-center justify-center text-center">
      <div className="max-w-md bg-white/5 border border-white/10 p-8 rounded-2xl">
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6">
             <LayoutDashboard className="h-8 w-8 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">Analytics Dashboard</h1>
          <p className="text-gray-400 mb-8">
            Detailed analytics are available on the web version of the application.
            Mobile and Desktop offline versions do not support live analytics verification currently.
          </p>
          <Link 
            href="/admin" 
            className="inline-flex items-center justify-center px-6 py-3 bg-nexa-gold text-nexa-black hover:bg-nexa-goldHover rounded-xl font-bold transition-all"
          >
            Return to Dashboard
          </Link>
      </div>
    </div>
  )
}
