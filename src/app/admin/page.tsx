'use client'

import { getClients } from '@/app/actions'
import { ClientTable } from '@/components/ClientTable'
import { StatCard } from '@/components/StatCard'
import { Users, DollarSign, Clock, LayoutDashboard } from 'lucide-react'
import { CreateClientModal } from '@/components/CreateClientModal'
import { CurrencySelector } from '@/components/CurrencySelector'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useEffect, useState } from 'react'

export default function AdminDashboard() {
  const { formatAmount } = useCurrency()
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadClients() {
      const data = await getClients()
      setClients(data)
      setLoading(false)
    }
    loadClients()
  }, [])

  const totalClients = clients.length
  const totalRevenue = clients.reduce((acc, curr) => acc + (curr.amountPaid || 0), 0)
  const outstandingBalance = clients.reduce((acc, curr) => acc + ((curr.priceQuoted || 0) - (curr.amountPaid || 0)), 0)
  const activeProjects = clients.filter(c => c.status === 'ACTIVE').length

  if (loading) {
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
          <p className="text-gray-400 text-base">Client Management Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <CurrencySelector />
          <CreateClientModal />
        </div>
      </div>

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
