'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Languages } from 'lucide-react'

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-medium text-sm group"
      title="Switch Language / تغيير اللغة"
    >
      <Languages className="h-4 w-4 text-nexa-gold group-hover:scale-110 transition-transform" />
      <span>{language === 'en' ? 'العربية' : 'English'}</span>
    </button>
  )
}
