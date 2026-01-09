'use client'

import { SessionProvider } from "next-auth/react"
import { CurrencyProvider } from "@/contexts/CurrencyContext"
import { Toaster } from "sonner"
import { PostHogProvider } from "./PostHogProvider"
import PostHogPageView from "./PostHogPageView"
import { LanguageProvider } from "@/contexts/LanguageContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <PostHogProvider>
          <PostHogPageView />
          <CurrencyProvider>
            {children}
            <Toaster position="top-right" theme="dark" />
          </CurrencyProvider>
        </PostHogProvider>
      </LanguageProvider>
    </SessionProvider>
  )
}
