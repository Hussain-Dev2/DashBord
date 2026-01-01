'use client'

import { ClientTable } from '@/components/ClientTable'
import { StatCard } from '@/components/StatCard'
import { Users, DollarSign, Clock, LayoutDashboard, Database } from 'lucide-react'
import { CreateClientModal } from '@/components/CreateClientModal'
import { CurrencySelector } from '@/components/CurrencySelector'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useClients } from '@/contexts/ClientsContext'
import { useSession } from 'next-auth/react'

import { LogIn, LogOut, User as UserIcon } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

// ... existing imports

export function AdminDashboardContent() {
  const { formatAmount } = useCurrency()
  const { clients, isLoading, resetDemoData } = useClients()
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
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-nexa-black text-white p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-nexa-gold to-white mb-2">
            Nexa Digital
          </h1>
          <div className="flex items-center gap-2">
            <p className="text-gray-400 text-base">Client Management Dashboard</p>
            {isAdmin ? (
               <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
                 Admin Mode
               </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Demo Mode
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
            <div className="flex items-center gap-4">
              {!isAuthenticated ? (
                <Link 
                  href="/login"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-nexa-gold to-nexa-goldHover text-nexa-black rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
              ) : (
                <button 
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              )}
              
              {!isAdmin && (
                 <button
                   onClick={resetDemoData}
                   className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-sm transition-colors border border-red-500/20"
                   title="Clear All Demo Data"
                 >
                   <Database className="w-4 h-4" />
                   Reset
                 </button>
              )}
              {isAdmin && (
                <Link
                  href="/admin/analytics"
                  className="flex items-center gap-2 px-3 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-sm transition-colors border border-blue-500/20"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Analytics
                </Link>
              )}
              <CurrencySelector />
              <CreateClientModal />
            </div>
        </div>
      </div>
      {/* ... rest of the component */}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard 
          title="Total Clients" 
          value={totalClients.toString()} 
          icon={Users} 
          description={totalClients === 0 ? "No clients yet" : `${activeProjects} active`}
        />
        <StatCard 
          title="Total Revenue" 
          value={formatAmount(totalRevenue)}
          icon={DollarSign}
          description={totalRevenue === 0 ? "Start earning by adding clients" : "Total earned"}
          isEmpty={totalRevenue === 0}
        />
        <StatCard 
          title="Outstanding" 
          value={formatAmount(outstandingBalance)}
          icon={Clock} 
          description={outstandingBalance === 0 ? "All payments received" : "Pending payments"}
        />
        <StatCard 
          title="Active Projects" 
          value={activeProjects.toString()} 
          icon={LayoutDashboard}
          description={activeProjects === 0 ? "No active projects" : "Currently working"}
        />
      </div>

      {/* Client List */}
      <div className="bg-gradient-to-br from-nexa-gray/40 to-nexa-gray/20 border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-white">All Clients</h2>
          <span className="text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/10">{totalClients} total</span>
        </div>
        <ClientTable clients={clients} />
      </div>
    </div>
  )
}
