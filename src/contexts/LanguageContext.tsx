'use client'

// استيراد أدوات مكتبة React
// Import React hooks and types
import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations, Language } from '@/lib/translations'

// تعريف هيكل بيانات سياق اللغة
interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: keyof typeof translations['en']) => string
  dir: 'ltr' | 'rtl'
  toggleLanguage: () => void
}

// إنشاء سياق اللغة
const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// موفر سياق اللغة (Wrapper)
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // الحالة الافتراضية للغة (إما الإنجليزية أو ما تم حفظه سابقاً)
  const [language, setLanguage] = useState<Language>('en')

  // جلب اللغة المفضلة من التخزين المحلي عند تحميل التطبيق
  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'en' || saved === 'ar')) {
      setLanguage(saved)
    }
  }, [])

  // حفظ اللغة وتغيير اتجاه الصفحة عند كل تغيير
  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
    // إذا كانت اللغة عربية، يتم ضبط الاتجاه من اليمين لليسار (RTL)
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
  }, [language])

  // دالة الترجمة: تبحث عن المفتاح في القاموس بناءً على اللغة المحددة
  const t = (key: keyof typeof translations['en']) => {
    return translations[language][key] || key
  }

  // دالة تبديل اللغة
  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en')
  }

  const value = {
    language,
    setLanguage,
    t,
    dir: language === 'ar' ? 'rtl' : 'ltr' as 'ltr' | 'rtl',
    toggleLanguage
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// خطاف (Hook) مخصص لاستخدام سياق اللغة بسهولة في المكونات
export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
