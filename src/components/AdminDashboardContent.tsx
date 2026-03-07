'use client'

import { ClientTable } from '@/components/ClientTable'
import { StatCard } from '@/components/StatCard'
import {
  Users, DollarSign, Clock, LayoutDashboard, Database,
  LogIn, LogOut, PlusCircle, Home, BarChart2, Settings
} from 'lucide-react'
import { CreateClientModal } from '@/components/CreateClientModal'
import { CurrencySelector } from '@/components/CurrencySelector'
import { LanguageToggle } from '@/components/LanguageToggle'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useClients } from '@/contexts/ClientsContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

export function AdminDashboardContent() {
  const { formatAmount } = useCurrency()
  const { clients, isLoading, resetDemoData } = useClients()
  const { t } = useLanguage()
  const { data: session, status } = useSession()
  const isAdmin = session?.user?.isAdmin
  const isAuthenticated = status === 'authenticated'

  const totalClients = clients.length
  const totalRevenue = clients.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0)
  const outstandingBalance = clients.reduce(
    (acc, curr) => acc + ((Number(curr.priceQuoted) || 0) - (Number(curr.amountPaid) || 0)),
    0
  )
  const activeProjects = clients.filter(c => c.status === 'ACTIVE').length
  const clientsWithDebt = clients.filter(c => (c.priceQuoted - c.amountPaid) > 0.01).length

  if (isLoading && clients.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--slate-900)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-2 border-nexa-gold border-t-transparent rounded-full animate-spin" />
          <div className="text-gray-400 text-sm">{t('loading')}</div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen pb-24 md:pb-10"
      style={{ background: 'linear-gradient(160deg, #0d0f1a 0%, #111327 50%, #0d0f1a 100%)' }}
    >
      {/* ── Header ── */}
      <header className="sticky top-0 z-30 glass-panel border-b border-white/8 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400/30 to-yellow-600/20 flex items-center justify-center shrink-0">
              <DollarSign className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none">DebtTrack</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-gray-500 text-xs">{t('dashboard_title')}</span>
                {isAdmin ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/15 text-green-400 border border-green-500/20">{t('admin_mode')}</span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/20">{t('demo_mode')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <CurrencySelector />

            {isAdmin && (
              <Link
                href="/admin/analytics"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-semibold hover:bg-blue-500/20 transition-colors"
              >
                <BarChart2 className="h-3.5 w-3.5" />
                {t('analytics')}
              </Link>
            )}

            {!isAdmin && (
              <button
                onClick={resetDemoData}
                className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
                title={t('reset_data')}
              >
                <Database className="h-4 w-4" />
              </button>
            )}

            {!isAuthenticated ? (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-2 btn-gold rounded-xl text-xs"
              >
                <LogIn className="h-3.5 w-3.5" />
                {t('sign_in')}
              </Link>
            ) : (
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 text-gray-300 hover:text-white rounded-xl text-xs transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t('sign_out')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">

        {/* ── Stat Cards (scroll on mobile) ── */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-4 mb-8">
          {[
            {
              title: t('total_clients'),
              value: totalClients.toString(),
              icon: Users,
              description: clientsWithDebt > 0 ? `${clientsWithDebt} with debt` : 'All clear!',
              variant: 'gold' as const,
            },
            {
              title: t('total_revenue'),
              value: formatAmount(totalRevenue),
              icon: DollarSign,
              description: totalRevenue === 0 ? t('start_earning') : t('total_earned'),
              isEmpty: totalRevenue === 0,
              variant: 'green' as const,
            },
            {
              title: t('outstanding'),
              value: formatAmount(outstandingBalance),
              icon: Clock,
              description: outstandingBalance === 0 ? t('all_paid') : `${clientsWithDebt} clients owe`,
              variant: 'red' as const,
            },
            {
              title: t('active_projects'),
              value: activeProjects.toString(),
              icon: LayoutDashboard,
              description: activeProjects === 0 ? t('no_active') : t('working'),
              variant: 'blue' as const,
            },
          ].map(card => (
            <div key={card.title} className="min-w-[220px] md:min-w-0 flex-1">
              <StatCard {...card} />
            </div>
          ))}
        </div>

        {/* ── Client List Panel ── */}
        <div className="glass-panel rounded-2xl p-4 md:p-6">
          <div className="flex items-center justify-between mb-5 gap-4">
            <div>
              <h2 className="text-xl font-bold text-white">{t('all_clients')}</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {totalClients} {t('total_clients')}
                {clientsWithDebt > 0 && (
                  <> · <span className="text-red-400 font-semibold">{clientsWithDebt} with outstanding debt</span></>
                )}
              </p>
            </div>
            {/* Desktop add button */}
            <div className="hidden md:block">
              <CreateClientModal />
            </div>
          </div>

          <ClientTable clients={clients} />
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ── */}
      <nav
        id="bottom-nav"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bottom-nav px-4 pt-2 pb-safe"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex items-center justify-around">
          {/* Home */}
          <Link href="/" className="flex flex-col items-center gap-0.5 p-2 text-nexa-gold">
            <Home className="h-5 w-5" />
            <span className="text-[10px] font-semibold">Home</span>
          </Link>

          {/* Clients */}
          <button className="flex flex-col items-center gap-0.5 p-2 text-gray-500">
            <Users className="h-5 w-5" />
            <span className="text-[10px]">Clients</span>
          </button>

          {/* Add Client FAB */}
          <div className="relative -mt-5">
            <div className="animate-pulse-gold rounded-full">
              <CreateClientModal />
            </div>
          </div>

          {/* Analytics */}
          {isAdmin ? (
            <Link href="/admin/analytics" className="flex flex-col items-center gap-0.5 p-2 text-gray-500">
              <BarChart2 className="h-5 w-5" />
              <span className="text-[10px]">Stats</span>
            </Link>
          ) : (
            <button className="flex flex-col items-center gap-0.5 p-2 text-gray-500">
              <BarChart2 className="h-5 w-5" />
              <span className="text-[10px]">Stats</span>
            </button>
          )}

          {/* Settings / Auth */}
          {!isAuthenticated ? (
            <Link href="/login" className="flex flex-col items-center gap-0.5 p-2 text-gray-500">
              <LogIn className="h-5 w-5" />
              <span className="text-[10px]">Sign In</span>
            </Link>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex flex-col items-center gap-0.5 p-2 text-gray-500"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[10px]">Sign Out</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  )
}
