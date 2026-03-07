'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { Languages } from 'lucide-react'

export function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage()

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all font-medium text-xs md:text-sm group"
      title="Switch Language / تغيير اللغة"
    >
      <Languages className="h-3.5 w-3.5 md:h-4 md:w-4 text-nexa-gold group-hover:scale-110 transition-transform" />
      <span className="hidden sm:inline">{language === 'en' ? 'العربية' : 'English'}</span>
      <span className="sm:hidden text-[10px]">{language === 'en' ? 'AR' : 'EN'}</span>
    </button>
  )
}
