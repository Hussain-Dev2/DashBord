'use client'

// استيراد موفري سياق البيانات (Providers) المختلفين
// Import various data context providers
import { SessionProvider } from "next-auth/react"
import { CurrencyProvider } from "@/contexts/CurrencyContext"
import { Toaster } from "sonner"
import { PostHogProvider } from "./PostHogProvider"
import PostHogPageView from "./PostHogPageView"
import { QueryProvider } from "@/providers/QueryProvider"
import { LanguageProvider } from "@/contexts/LanguageContext"

// المكون الأساسي الذي يجمع كل موفري البيانات لتغليف التطبيق بها
// Main component that wraps the application with all context providers
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // موفر سياق الجلسة (لإدارة تسجيل الدخول)
    <SessionProvider>
      <QueryProvider>
        {/* موفر سياق اللغة (للترجمة والاتجاه الداخلي) */}
        <LanguageProvider>
          {/* موفر سياق التحليلات (PostHog) */}
          <PostHogProvider>
            <PostHogPageView />
            {/* موفر سياق العملة (لتحويل العملات) */}
            <CurrencyProvider>
            {children}
            {/* مكون عرض رسائل التنبيه (Toasts) */}
            <Toaster position="top-right" theme="dark" />
          </CurrencyProvider>
        </PostHogProvider>
      </LanguageProvider>
      </QueryProvider>
    </SessionProvider>
  )
}
