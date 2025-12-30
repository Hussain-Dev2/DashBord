'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Search, Filter, MoreHorizontal, ExternalLink, Eye } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/format'

type Client = {
  id: string
  name: string
  industry: string | null
  status: string
  phone: string | null
  priceQuoted: number
  amountPaid: number
  updatedAt: Date
  logoUrl: string | null
}

export function ClientTable({ clients }: { clients: Client[] }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const router = useRouter()

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) || 
                          (client.phone && client.phone.includes(search))
    const matchesStatus = statusFilter === 'ALL' || client.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Status Badge Helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'SUSPENDED': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20' // LEAD
    }
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-nexa-gray/30 border border-white/10 rounded-md text-sm focus:outline-none focus:border-nexa-gold/50 transition-colors placeholder:text-gray-600"
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
            {['ALL', 'LEAD', 'ACTIVE', 'PENDING', 'SUSPENDED'].map((status) => (
                <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors ${
                        statusFilter === status 
                        ? 'bg-nexa-gold/10 border-nexa-gold text-nexa-gold' 
                        : 'border-white/10 text-gray-400 hover:bg-white/5'
                    }`}
                >
                    {status}
                </button>
            ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border border-white/10 bg-nexa-gray/20 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-white/5 text-gray-400">
            <tr>
              <th className="px-6 py-4 font-medium">Client Name</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Financials</th>
              <th className="px-6 py-4 font-medium">Last Contact</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredClients.map((client) => {
                const balance = client.priceQuoted - client.amountPaid
                return (
                <tr key={client.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-nexa-gold/20 flex items-center justify-center text-nexa-gold font-bold">
                        {client.logoUrl ? (
                            <img src={client.logoUrl} alt={client.name} className="h-full w-full object-cover rounded-full" />
                        ) : (
                            client.name.substring(0, 2).toUpperCase()
                        )}
                    </div>
                    <div>
                        <div className="text-sm">{client.name}</div>
                        <div className="text-xs text-gray-500">{client.industry || 'No Industry'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(client.status)}`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                        <span className="text-gray-300">Revenue: ${formatCurrency(client.amountPaid)}</span>
                        {balance > 0 && <span className="text-red-400 text-xs">Due: ${formatCurrency(balance)}</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-400">
                    {formatDate(client.updatedAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/clients/${client.id}`} className="p-2 hover:bg-white/10 rounded-md text-gray-400 hover:text-white transition-colors">
                            <Eye className="h-4 w-4" />
                        </Link>
                    </div>
                  </td>
                </tr>
            )})}
            {filteredClients.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                        No clients found matching your search.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
