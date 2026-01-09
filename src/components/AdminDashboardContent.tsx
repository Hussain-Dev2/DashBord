'use client'

import { ClientTable } from '@/components/ClientTable'
import { StatCard } from '@/components/StatCard'
import { Users, DollarSign, Clock, LayoutDashboard, Database } from 'lucide-react'
import { CreateClientModal } from '@/components/CreateClientModal'
import { CurrencySelector } from '@/components/CurrencySelector'
import { LanguageToggle } from '@/components/LanguageToggle'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useClients } from '@/contexts/ClientsContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useSession } from 'next-auth/react'

import { LogIn, LogOut } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

// ... existing imports

export function AdminDashboardContent() {
  const { formatAmount } = useCurrency()
  const { clients, isLoading, resetDemoData } = useClients()
  const { t } = useLanguage()
  const { data: session, status } = useSession()
  const isAdmin = session?.user?.isAdmin
  const isAuthenticated = status === 'authenticated'

  // Safe checks for potentially undefined fields if matching different types
  const totalClients = clients.length
  const totalRevenue = clients.reduce((acc, curr) => acc + (Number(curr.amountPaid) || 0), 0)
  const outstandingBalance = clients.reduce((acc, curr) => acc + ((Number(curr.priceQuoted) || 0) - (Number(curr.amountPaid) || 0)), 0)
  const activeProjects = clients.filter(c => c.status === 'ACTIVE').length

  if (isLoading && clients.length === 0) {
    return (
      <div className="min-h-screen bg-nexa-black text-white flex items-center justify-center">
        <div className="text-xl text-gray-400">{t('loading')}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nexa-black text-white p-4 md:p-10 pb-20 md:pb-10">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-nexa-gold to-white mb-2">
            Nexa Digital
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-gray-400 text-sm md:text-base">{t('dashboard_title')}</p>
            {isAdmin ? (
               <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                 {t('admin_mode')}
               </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                {t('demo_mode')}
              </span>
            )}
          </div>
        </div>
        
        {/* Controls Grid - Scrollable on mobile or wrapped */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {!isAuthenticated ? (
                <Link 
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-nexa-gold to-nexa-goldHover text-nexa-black rounded-xl font-semibold hover:shadow-lg transition-all text-sm"
                >
                  <LogIn className="h-4 w-4" />
                  {t('sign_in')}
                </Link>
              ) : (
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  {t('sign_out')}
                </button>
              )}
              
              {!isAdmin && (
                 <button
                   onClick={resetDemoData}
                   className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm transition-colors border border-red-500/20"
                   title={t('reset_data')}
                 >
                   <Database className="w-4 h-4" />
                   <span className="hidden sm:inline">{t('reset_data')}</span>
                 </button>
              )}
              {isAdmin && (
                <Link
                  href="/admin/analytics"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-sm transition-colors border border-blue-500/20"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t('analytics')}
                </Link>
              )}
              
              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                  <LanguageToggle />
                  <CurrencySelector />
              </div>
            </div>
            
            <div className="w-full sm:w-auto mt-2 sm:mt-0">
                <CreateClientModal />
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title={t('total_clients')} 
          value={totalClients.toString()} 
          icon={Users} 
          description={totalClients === 0 ? "No clients yet" : `${activeProjects} active`}
        />
        <StatCard 
          title={t('total_revenue')} 
          value={formatAmount(totalRevenue)}
          icon={DollarSign}
          description={totalRevenue === 0 ? t('start_earning') : t('total_earned')}
          isEmpty={totalRevenue === 0}
        />
        <StatCard 
          title={t('outstanding')} 
          value={formatAmount(outstandingBalance)}
          icon={Clock} 
          description={outstandingBalance === 0 ? t('all_paid') : t('pending_payments')}
        />
        <StatCard 
          title={t('active_projects')} 
          value={activeProjects.toString()} 
          icon={LayoutDashboard}
          description={activeProjects === 0 ? t('no_active') : t('working')}
        />
      </div>

      {/* Client List */}
      <div className="glass-panel rounded-2xl p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{t('all_clients')}</h2>
          <span className="text-xs md:text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10 whitespace-nowrap">
            {totalClients} {t('total_clients')}
          </span>
        </div>
        <ClientTable clients={clients} />
      </div>
    </div>
  )
}
