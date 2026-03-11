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
  // On first visit, fall back to the device's browser language
  useEffect(() => {
    const saved = localStorage.getItem('language') as Language
    if (saved && (saved === 'en' || saved === 'ar')) {
      // User has a saved preference — use it
      setLanguage(saved)
    } else {
      // First visit: detect the device language from the browser
      const deviceLang = navigator.language || (navigator as any).userLanguage || 'en'
      // If the device is using any Arabic locale (e.g. ar, ar-IQ, ar-SA...), default to Arabic
      const detected: Language = deviceLang.startsWith('ar') ? 'ar' : 'en'
      setLanguage(detected)
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
    // إضافة فئة لمنع الرسوم الانتقالية مؤقتاً عند تغيير الاتجاه
    // Add class to temporarily disable transitions when direction changes
    document.documentElement.classList.add('no-transitions')
    
    setLanguage(prev => prev === 'en' ? 'ar' : 'en')

    // إزالة الفئة بعد وقت قصير للسماح بعودة الرسوم الانتقالية الطبيعية
    // Remove class after a short delay
    setTimeout(() => {
      document.documentElement.classList.remove('no-transitions')
    }, 100)
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
