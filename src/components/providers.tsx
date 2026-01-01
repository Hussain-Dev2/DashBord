'use client'

import { SessionProvider } from "next-auth/react"
import { CurrencyProvider } from "@/contexts/CurrencyContext"
import { Toaster } from "sonner"
import { PostHogProvider } from "./PostHogProvider"
import PostHogPageView from "./PostHogPageView"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PostHogProvider>
        <PostHogPageView />
        <CurrencyProvider>
          {children}
          <Toaster position="top-right" theme="dark" />
        </CurrencyProvider>
      </PostHogProvider>
    </SessionProvider>
  )
}
