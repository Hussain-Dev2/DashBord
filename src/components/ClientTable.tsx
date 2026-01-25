'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClients } from '@/contexts/ClientsContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { Search, ListFilter, X, Trash2 } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/format'
import { useCurrency } from '@/contexts/CurrencyContext'

// Local or imported types
type Client = {
  id: string
  name: string
  industry: string | null
  status: string
  phone: string | null
  priceQuoted: number
  amountPaid: number
  updatedAt: Date | string
  logoUrl: string | null
  lastPayment?: string | null
}

type FilterPreset = 'ALL' | 'DEBT' | 'PAID' | 'HIGH_VALUE' | 'ACTIVE' | 'DORMANT'
type SortMode = 'DEFAULT' | 'LAST_PAYMENT'

export function ClientTable({ clients }: { clients: Client[] }) {
  const { deleteClientFn, isLoading } = useClients()
  const { t } = useLanguage()
  const { formatAmount } = useCurrency()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [filterPreset, setFilterPreset] = useState<FilterPreset>('ALL')
  const [sortMode, setSortMode] = useState<SortMode>('DEFAULT')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()

  const filteredClients = React.useMemo(() => {
    return clients.filter(client => {
      // 1. Search Query
      const matchesSearch = client.name.toLowerCase().includes(search.toLowerCase()) || 
                            (client.phone && client.phone.includes(search))

      // 2. Status Filter
      const matchesStatus = statusFilter === 'ALL' || client.status === statusFilter
      
      // 3. Smart Filter Preset
      let matchesPreset = true
      const balance = client.priceQuoted - client.amountPaid
      const now = new Date()
      // Handle potentially string dates from JSON serialization
      const updatedAt = new Date(client.updatedAt)
      const daysSinceUpdate = (now.getTime() - updatedAt.getTime()) / (1000 * 3600 * 24)

      if (filterPreset === 'DEBT') {
          matchesPreset = balance > 0
      } else if (filterPreset === 'PAID') {
          matchesPreset = balance <= 0
      } else if (filterPreset === 'HIGH_VALUE') {
          matchesPreset = client.priceQuoted >= 5000
      } else if (filterPreset === 'ACTIVE') {
          matchesPreset = daysSinceUpdate <= 30
      } else if (filterPreset === 'DORMANT') {
          matchesPreset = daysSinceUpdate > 30
      }

      return matchesSearch && matchesStatus && matchesPreset
    }).sort((a, b) => {
      // 4. Sorting logic
      if (sortMode === 'LAST_PAYMENT') {
          const dateA = a.lastPayment ? new Date(a.lastPayment).getTime() : 0
          const dateB = b.lastPayment ? new Date(b.lastPayment).getTime() : 0
          return dateB - dateA // Descending
      }
      return 0 // Default sort
    })
  }, [clients, search, statusFilter, filterPreset, sortMode])

  // Status Badge Helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'SUSPENDED': return 'bg-red-500/10 text-red-500 border-red-500/20'
      default: return 'bg-blue-500/10 text-blue-500 border-blue-500/20' // LEAD
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm(t('delete_confirm'))) {
        await deleteClientFn(id)
    }
  }

  // Mobile Card Component
  const MobileClientCard = ({ client }: { client: Client }) => {
    const balance = client.priceQuoted - client.amountPaid
    return (
        <div 
          onClick={() => router.push(`/admin/clients/${client.id}`)}
          className="group block p-4 bg-white/5 border border-white/10 rounded-xl mb-4 hover:border-nexa-gold/50 transition-all cursor-pointer relative overflow-hidden"
        >
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
               <div className="text-nexa-gold text-xs font-bold">Details &rarr;</div>
            </div>

            <div className="flex items-start gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-nexa-gold/20 flex items-center justify-center text-nexa-gold font-bold ring-2 ring-white/5 shrink-0">
                    {client.logoUrl ? (
                        <img src={client.logoUrl} alt={client.name} className="h-full w-full object-cover rounded-full" />
                    ) : (
                        client.name.substring(0, 2).toUpperCase()
                    )}
                </div>
                <div>
                    <div className="text-base font-bold text-white">{client.name}</div>
                    <div className="text-xs text-gray-500">{client.industry || 'No Industry'}</div>
                    <div className="mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(client.status)}`}>
                          {client.status}
                        </span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-white/5 rounded-lg p-2">
                     <span className="text-xs text-gray-500 block">{t('price_quoted')}</span>
                     <span className="text-white font-medium">{formatAmount(client.priceQuoted)}</span>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                     <span className="text-xs text-gray-500 block">{t('initial_payment')}</span>
                     <span className="text-white font-medium">{formatAmount(client.amountPaid)}</span>
                </div>
            </div>
            
            {balance > 0.01 && (
                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg text-center">
                    <span className="text-xs text-red-400 font-bold block">DUE: {formatAmount(balance)}</span>
                </div>
            )}
        </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-start xl:items-center">
        
        {/* Search & Status */}
        <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
            <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 rtl:right-3 rtl:left-auto" />
                <input
                    placeholder={t('search_placeholder')}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 rtl:pr-9 rtl:pl-4 py-2 glass-input placeholder:text-gray-600"
                />
            </div>

            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-hide">
                {['ALL', 'LEAD', 'ACTIVE', 'PENDING', 'SUSPENDED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
                            statusFilter === status 
                            ? 'bg-nexa-gold/10 border-nexa-gold text-nexa-gold' 
                            : 'border-white/5 text-gray-500 hover:bg-white/5 hover:text-gray-300'
                        }`}
                    >
                        {status === 'ALL' ? t('filter_all') : status}
                    </button>
                ))}
            </div>
        </div>
        
        {/* Smart Filters Dropdown Area */}
        <div className="flex gap-3 w-full xl:w-auto relative z-20">
            {/* Filter Dropdown Toggle */}
            <div className="relative">
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                      filterPreset !== 'ALL' || sortMode !== 'DEFAULT'
                      ? 'bg-nexa-gold text-nexa-black border-nexa-gold'
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                    <ListFilter className="h-4 w-4" />
                    <span>{t('filter_sort')}</span>
                    {(filterPreset !== 'ALL' || sortMode !== 'DEFAULT') && (
                         <div className="bg-nexa-black/20 rounded-full px-1.5 py-0.5 text-[10px] font-bold">
                             !
                         </div>
                    )}
                </button>

                {isFilterOpen && (
                    <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                    <div className="absolute right-0 rtl:left-0 rtl:right-auto top-full mt-2 w-56 glass-panel z-20 overflow-hidden">
                        <div className="p-2 space-y-1">
                            <div className="text-xs font-semibold text-gray-500 px-2 py-1 uppercase tracking-wider">{t('smart_filters')}</div>
                            
                            <button onClick={() => { setFilterPreset('ALL'); setIsFilterOpen(false) }} className={`w-full text-left rtl:text-right px-3 py-2 rounded-lg text-sm transition-colors ${filterPreset === 'ALL' ? 'bg-nexa-gold/10 text-nexa-gold' : 'text-gray-300 hover:bg-white/5'}`}>
                                {t('filter_all')}
                            </button>
                            <button onClick={() => { setFilterPreset('DEBT'); setIsFilterOpen(false) }} className={`w-full text-left rtl:text-right px-3 py-2 rounded-lg text-sm transition-colors ${filterPreset === 'DEBT' ? 'bg-nexa-gold/10 text-nexa-gold' : 'text-gray-300 hover:bg-white/5'}`}>
                                {t('filter_debt')}
                            </button>
                            <button onClick={() => { setFilterPreset('PAID'); setIsFilterOpen(false) }} className={`w-full text-left rtl:text-right px-3 py-2 rounded-lg text-sm transition-colors ${filterPreset === 'PAID' ? 'bg-nexa-gold/10 text-nexa-gold' : 'text-gray-300 hover:bg-white/5'}`}>
                                {t('filter_paid')}
                            </button>
                            <button onClick={() => { setFilterPreset('HIGH_VALUE'); setIsFilterOpen(false) }} className={`w-full text-left rtl:text-right px-3 py-2 rounded-lg text-sm transition-colors ${filterPreset === 'HIGH_VALUE' ? 'bg-nexa-gold/10 text-nexa-gold' : 'text-gray-300 hover:bg-white/5'}`}>
                                {t('filter_high')}
                            </button>
                            <button onClick={() => { setFilterPreset('ACTIVE'); setIsFilterOpen(false) }} className={`w-full text-left rtl:text-right px-3 py-2 rounded-lg text-sm transition-colors ${filterPreset === 'ACTIVE' ? 'bg-nexa-gold/10 text-nexa-gold' : 'text-gray-300 hover:bg-white/5'}`}>
                                {t('filter_active')}
                            </button>
                            <button onClick={() => { setFilterPreset('DORMANT'); setIsFilterOpen(false) }} className={`w-full text-left rtl:text-right px-3 py-2 rounded-lg text-sm transition-colors ${filterPreset === 'DORMANT' ? 'bg-nexa-gold/10 text-nexa-gold' : 'text-gray-300 hover:bg-white/5'}`}>
                                {t('filter_dormant')}
                            </button>

                            <div className="h-px bg-white/10 my-1" />
                            <div className="text-xs font-semibold text-gray-500 px-2 py-1 uppercase tracking-wider">Sorting</div>
                            
                            <button onClick={() => { setSortMode(sortMode === 'DEFAULT' ? 'LAST_PAYMENT' : 'DEFAULT'); setIsFilterOpen(false) }} className={`w-full text-left rtl:text-right px-3 py-2 rounded-lg text-sm transition-colors ${sortMode === 'LAST_PAYMENT' ? 'bg-nexa-gold/10 text-nexa-gold' : 'text-gray-300 hover:bg-white/5'}`}>
                                {t('sort_payment')} {sortMode === 'LAST_PAYMENT' && '✓'}
                            </button>
                        </div>
                    </div>
                    </>
                )}
            </div>

            {(filterPreset !== 'ALL' || sortMode !== 'DEFAULT') && (
                <button 
                  onClick={() => { setFilterPreset('ALL'); setSortMode('DEFAULT') }}
                  className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  title={t('clear_filters')}
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
      </div>

      {/* Mobile Card View (Visible on Small Screens) */}
      <div className="md:hidden">
          {filteredClients.length > 0 ? (
              filteredClients.map(client => <MobileClientCard key={client.id} client={client} />)
          ) : (
                <div className="p-8 text-center text-gray-500">
                    <p>{t('no_clients_found')}</p>
                </div>
          )}
      </div>

      {/* Desktop Table View (Hidden on Small Screens) */}
      <div className="hidden md:block rounded-xl border border-white/10 bg-nexa-gray/20 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-xs uppercase bg-white/5 text-gray-400 font-semibold tracking-wider">
                <tr>
                <th className="px-6 py-4">{t('client_name')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4">{t('financials')}</th>
                <th className="px-6 py-4">{t('last_activity')}</th>
                <th className="px-6 py-4 text-right rtl:text-left">{t('actions')}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                {filteredClients.map((client) => {
                    const balance = client.priceQuoted - client.amountPaid
                    return (
                    <tr 
                        key={client.id} 
                        onClick={() => router.push(`/admin/clients/${client.id}`)}
                        className="hover:bg-white/5 transition-colors group cursor-pointer"
                    >
                    <td className="px-6 py-4 font-medium text-white">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 shrink-0 rounded-full bg-nexa-gold/20 flex items-center justify-center text-nexa-gold font-bold ring-2 ring-white/5">
                                {client.logoUrl ? (
                                    <img src={client.logoUrl} alt={client.name} className="h-full w-full object-cover rounded-full" />
                                ) : (
                                    client.name.substring(0, 2).toUpperCase()
                                )}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white group-hover:text-nexa-gold transition-colors">{client.name}</div>
                                <div className="text-xs text-gray-500">{client.industry || 'No Industry'}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getStatusColor(client.status)}`}>
                        {client.status}
                        </span>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs">{t('initial_payment')}:</span>
                                <span className="text-white font-medium">{formatAmount(client.amountPaid)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs">{t('price_quoted')}:</span>
                                <span className="text-gray-500 text-xs">{formatAmount(client.priceQuoted)}</span>
                            </div>
                            {balance > 0.01 && (
                                <div className="mt-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold rounded w-fit">
                                    DUE: {formatAmount(balance)}
                                </div>
                            )}
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="flex flex-col gap-0.5">
                             <div className="text-gray-300 text-xs text-nowrap">
                                <span className="text-gray-500">Updated:</span> {formatDate(new Date(client.updatedAt))}
                             </div>
                             {client.lastPayment && (
                                 <div className="text-nexa-gold text-xs text-nowrap">
                                     <span className="text-gray-500">Pd:</span> {formatDate(new Date(client.lastPayment))}
                                 </div>
                             )}
                        </div>
                    </td>
                    <td className="px-6 py-4 text-right rtl:text-left">
                        <div className="flex justify-end rtl:justify-start gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleDelete(client.id)
                                }}
                                disabled={isLoading}
                                className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-500 transition-colors border border-transparent hover:border-red-500/20 disabled:opacity-50"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </td>
                    </tr>
                )})}
                {filteredClients.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 bg-white/[0.02]">
                        <div className="flex flex-col items-center gap-2">
                            <Search className="h-8 w-8 text-gray-600" />
                            <p>{t('no_clients_found')}</p>
                            <button onClick={() => { setSearch(''); setStatusFilter('ALL'); setFilterPreset('ALL'); setSortMode('DEFAULT') }} className="text-nexa-gold hover:underline text-sm mt-2">
                                {t('clear_filters')}
                            </button>
                        </div>
                    </td>
                </tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  )
}
