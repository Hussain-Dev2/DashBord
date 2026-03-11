'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClients } from '@/contexts/ClientsContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { Search, ListFilter, X, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { formatDate } from '@/lib/format'
import { QuickPaymentUpdate } from '@/components/QuickPaymentUpdate'

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
type SortMode = 'DEFAULT' | 'LAST_PAYMENT' | 'HIGHEST_DEBT'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    'bg-green-500/15 text-green-400 border-green-500/25',
  PENDING:   'bg-amber-500/15 text-amber-400 border-amber-500/25',
  SUSPENDED: 'bg-red-500/15   text-red-400   border-red-500/25',
  LEAD:      'bg-blue-500/15  text-blue-400  border-blue-500/25',
}

function ClientAvatar({ client, className }: { client: Client, className?: string }) {
  const initials = client.name.substring(0, 2).toUpperCase()
  // Deterministic color per client
  const colors = ['from-amber-400/30 to-amber-600/20', 'from-blue-400/30 to-blue-600/20', 'from-purple-400/30 to-purple-600/20', 'from-green-400/30 to-green-600/20']
  const colorIdx = client.name.charCodeAt(0) % colors.length
  return (
    <div className={`rounded-full bg-gradient-to-br ${colors[colorIdx]} flex items-center justify-center text-white font-bold text-sm ring-2 ring-white/5 shrink-0 ${className || 'h-11 w-11'}`}>
      {client.logoUrl
        ? <img src={client.logoUrl} alt={client.name} className="h-full w-full object-cover rounded-full" />
        : initials
      }
    </div>
  )
}

// Mobile expandable card
function MobileClientCard({ client }: { client: Client }) {
  const [expanded, setExpanded] = useState(false)
  const { t, language } = useLanguage()
  const { formatAmount } = useCurrency()
  const router = useRouter()

  const balance = client.priceQuoted - client.amountPaid
  const isFullyPaid = balance <= 0.01
  const progress = client.priceQuoted > 0 ? Math.min(100, (client.amountPaid / client.priceQuoted) * 100) : 0
  const statusClass = STATUS_COLORS[client.status] ?? 'bg-white/10 text-gray-400 border-white/10'

  return (
    <div className="glass-card rounded-2xl overflow-hidden mb-3 animate-slide-up">
      {/* Main row — click to expand */}
      <div
        className="flex items-center gap-2.5 p-3 cursor-pointer"
        onClick={() => setExpanded(v => !v)}
      >
        <ClientAvatar client={client} className="h-9 w-9 text-xs" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-1.5 mb-0.5">
            <span className="text-white font-semibold text-xs leading-tight">{client.name}</span>
            <span className={`px-1 py-0.5 rounded-[4px] text-[8px] font-bold border shrink-0 ${statusClass}`}>{client.status}</span>
          </div>
          <div className="text-[10px] text-gray-500 line-clamp-1">{client.industry || 'No Industry'}</div>

          {/* Progress bar */}
          <div className="mt-2">
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                  background: isFullyPaid
                    ? (language === 'ar' ? 'linear-gradient(-90deg, #22c55e, #4ade80)' : 'linear-gradient(90deg, #22c55e, #4ade80)')
                    : progress > 60
                      ? (language === 'ar' ? 'linear-gradient(-90deg, #D4AF37, #fbbf24)' : 'linear-gradient(90deg, #D4AF37, #fbbf24)')
                      : (language === 'ar' ? 'linear-gradient(-90deg, #ef4444, #f87171)' : 'linear-gradient(90deg, #ef4444, #f87171)'),
                }}
              />
            </div>
          </div>
        </div>

        {/* Debt amount */}
        <div className="text-end shrink-0">
          {isFullyPaid ? (
            <div className="paid-badge text-[9px] py-0.5 px-1.5">PAID</div>
          ) : (
            <div className="text-red-400 font-bold text-xs">{formatAmount(balance)}</div>
          )}
          <div className="text-gray-600 text-[10px] mt-0.5">due</div>
        </div>

        {/* Expand chevron */}
        <div className="text-gray-600 ms-1 shrink-0">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>

      {/* Expanded quick actions */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5 pt-3 space-y-3 animate-slide-up">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/5 rounded-xl p-2.5">
              <div className="text-gray-500 mb-0.5">Total Debt</div>
              <div className="text-white font-semibold">{formatAmount(client.priceQuoted)}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5">
              <div className="text-gray-500 mb-0.5">Amount Paid</div>
              <div className="text-green-400 font-semibold">{formatAmount(client.amountPaid)}</div>
            </div>
          </div>

          <QuickPaymentUpdate
            clientId={client.id}
            currentAmount={client.amountPaid}
            totalAmount={client.priceQuoted}
          />

          <button
            onClick={() => router.push(`/admin/client?id=${client.id}`)}
            className="w-full py-2 rounded-xl text-xs font-semibold text-nexa-gold border border-nexa-gold/30 hover:bg-nexa-gold/10 transition-all"
          >
            View Full Details →
          </button>
        </div>
      )}
    </div>
  )
}

export function ClientTable({ clients }: { clients: Client[] }) {
  const { deleteClientFn, isLoading } = useClients()
  const { t, language } = useLanguage()
  const { formatAmount } = useCurrency()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [filterPreset, setFilterPreset] = useState<FilterPreset>('ALL')
  const [sortMode, setSortMode] = useState<SortMode>('HIGHEST_DEBT')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()

  const filteredClients = React.useMemo(() => {
    return clients
      .filter(client => {
        const matchesSearch =
          client.name.toLowerCase().includes(search.toLowerCase()) ||
          (client.phone && client.phone.includes(search))

        const matchesStatus = statusFilter === 'ALL' || client.status === statusFilter

        let matchesPreset = true
        const balance = client.priceQuoted - client.amountPaid
        const now = new Date()
        const daysSinceUpdate = (now.getTime() - new Date(client.updatedAt).getTime()) / (1000 * 3600 * 24)

        if (filterPreset === 'DEBT')       matchesPreset = balance > 0
        else if (filterPreset === 'PAID')  matchesPreset = balance <= 0
        else if (filterPreset === 'HIGH_VALUE') matchesPreset = client.priceQuoted >= 5000
        else if (filterPreset === 'ACTIVE')     matchesPreset = daysSinceUpdate <= 30
        else if (filterPreset === 'DORMANT')    matchesPreset = daysSinceUpdate > 30

        return matchesSearch && matchesStatus && matchesPreset
      })
      .sort((a, b) => {
        if (sortMode === 'HIGHEST_DEBT') {
          const dA = a.priceQuoted - a.amountPaid
          const dB = b.priceQuoted - b.amountPaid
          return dB - dA
        }
        if (sortMode === 'LAST_PAYMENT') {
          const dateA = a.lastPayment ? new Date(a.lastPayment).getTime() : 0
          const dateB = b.lastPayment ? new Date(b.lastPayment).getTime() : 0
          return dateB - dateA
        }
        return 0
      })
  }, [clients, search, statusFilter, filterPreset, sortMode])

  const handleDelete = async (id: string) => {
    if (confirm(t('delete_confirm'))) await deleteClientFn(id)
  }

  const clearFilters = () => {
    setFilterPreset('ALL')
    setSortMode('HIGHEST_DEBT')
    setStatusFilter('ALL')
    setSearch('')
  }

  return (
    <div className="space-y-4">
      {/* ── Controls ── */}
      <div className="flex flex-col gap-3">
        {/* Search row */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              id="client-search"
              placeholder={t('search_placeholder')}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full ps-9 pe-3 py-2.5 glass-input text-sm"
            />
          </div>

          {/* Filter dropdown */}
          <div className="relative">
            <button
              id="filter-toggle"
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                filterPreset !== 'ALL' || sortMode !== 'HIGHEST_DEBT'
                  ? 'bg-nexa-gold text-nexa-black border-nexa-gold'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              <ListFilter className="h-4 w-4" />
              <span className="hidden sm:inline">Filter</span>
            </button>

            {isFilterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFilterOpen(false)} />
                <div className="absolute end-0 top-full mt-2 w-52 glass-panel rounded-xl z-20 overflow-hidden">
                  <div className="p-2 space-y-0.5">
                    <div className="text-[10px] font-bold text-gray-500 px-3 py-1.5 uppercase tracking-wider">Smart Filters</div>
                    {(['ALL', 'DEBT', 'PAID', 'HIGH_VALUE', 'ACTIVE', 'DORMANT'] as FilterPreset[]).map(preset => (
                      <button
                        key={preset}
                        onClick={() => { setFilterPreset(preset); setIsFilterOpen(false) }}
                        className={`w-full text-left rtl:text-right px-3 py-2 rounded-lg text-sm transition-colors ${filterPreset === preset ? 'bg-nexa-gold/15 text-nexa-gold' : 'text-gray-300 hover:bg-white/5'}`}
                      >
                        {preset === 'ALL' ? t('filter_all') : preset === 'DEBT' ? t('filter_debt') : preset === 'PAID' ? t('filter_paid') : preset === 'HIGH_VALUE' ? t('filter_high') : preset === 'ACTIVE' ? t('filter_active') : t('filter_dormant')}
                      </button>
                    ))}
                    <div className="h-px bg-white/10 my-1" />
                    <div className="text-[10px] font-bold text-gray-500 px-3 py-1.5 uppercase tracking-wider">Sort</div>
                    {(['HIGHEST_DEBT', 'LAST_PAYMENT', 'DEFAULT'] as SortMode[]).map(sm => (
                      <button
                        key={sm}
                        onClick={() => { setSortMode(sm); setIsFilterOpen(false) }}
                        className={`w-full text-left rtl:text-right px-3 py-2 rounded-lg text-sm transition-colors ${sortMode === sm ? 'bg-nexa-gold/15 text-nexa-gold' : 'text-gray-300 hover:bg-white/5'}`}
                      >
                        {sm === 'HIGHEST_DEBT' ? 'Highest Debt First' : sm === 'LAST_PAYMENT' ? t('sort_payment') : 'Default'}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Clear */}
          {(filterPreset !== 'ALL' || search || statusFilter !== 'ALL') && (
            <button
              onClick={clearFilters}
              className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title={t('clear_filters')}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Status pills */}
        <div className={`flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
          {['ALL', 'LEAD', 'ACTIVE', 'PENDING', 'SUSPENDED'].map(s => (
            <button
              key={s}
              id={`status-${s.toLowerCase()}`}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border whitespace-nowrap transition-all ${
                statusFilter === s
                  ? 'bg-nexa-gold/15 border-nexa-gold text-nexa-gold'
                  : 'border-white/8 text-gray-500 hover:bg-white/5 hover:text-gray-300'
              }`}
            >
              {s === 'ALL' ? t('filter_all') : s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Mobile Cards ── */}
      <div className="md:hidden">
        {filteredClients.length > 0
          ? filteredClients.map(c => <MobileClientCard key={c.id} client={c} />)
          : (
            <div className="py-12 text-center text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-700" />
              <p>{t('no_clients_found')}</p>
              <button onClick={clearFilters} className="mt-3 text-nexa-gold text-sm hover:underline">{t('clear_filters')}</button>
            </div>
          )
        }
      </div>

      {/* ── Desktop Table ── */}
      <div className="hidden md:block rounded-2xl border border-white/8 overflow-hidden glass-panel">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left rtl:text-right">
            <thead className="text-[11px] uppercase tracking-wider text-gray-500 border-b border-white/8 font-semibold">
              <tr>
                <th className="px-6 py-4">{t('client_name')}</th>
                <th className="px-6 py-4">{t('status')}</th>
                <th className="px-6 py-4">Debt Overview</th>
                <th className="px-6 py-4">Quick Actions</th>
                <th className="px-6 py-4">{t('last_activity')}</th>
                <th className="px-4 py-4 text-right rtl:text-left">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredClients.map(client => {
                const balance = client.priceQuoted - client.amountPaid
                const isFullyPaid = balance <= 0.01
                const progress = client.priceQuoted > 0 ? Math.min(100, (client.amountPaid / client.priceQuoted) * 100) : 0
                const statusClass = STATUS_COLORS[client.status] ?? 'bg-white/10 text-gray-400 border-white/10'

                return (
                  <tr
                    key={client.id}
                    className="hover:bg-white/[0.03] transition-colors group"
                  >
                    {/* Name + avatar */}
                    <td
                      className="px-6 py-4 cursor-pointer"
                      onClick={() => router.push(`/admin/client?id=${client.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <ClientAvatar client={client} />
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-nexa-gold transition-colors">{client.name}</div>
                          <div className="text-xs text-gray-500">{client.industry || 'No Industry'}</div>
                          {client.phone && <div className="text-xs text-gray-600 mt-0.5">{client.phone}</div>}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${statusClass}`}>
                        {client.status}
                      </span>
                    </td>

                    {/* Debt overview */}
                    <td className="px-6 py-4">
                      <div className="min-w-[140px]">
                        <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-400">{formatAmount(client.amountPaid)} paid</span>
                          {isFullyPaid
                            ? <span className="paid-badge">PAID</span>
                            : <span className="debt-badge">DUE {formatAmount(balance)}</span>
                          }
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${progress}%`,
                              background: isFullyPaid
                                ? (language === 'ar' ? 'linear-gradient(-90deg,#22c55e,#4ade80)' : 'linear-gradient(90deg,#22c55e,#4ade80)')
                                : progress > 60
                                  ? (language === 'ar' ? 'linear-gradient(-90deg,#D4AF37,#fbbf24)' : 'linear-gradient(90deg,#D4AF37,#fbbf24)')
                                  : (language === 'ar' ? 'linear-gradient(-90deg,#ef4444,#f87171)' : 'linear-gradient(90deg,#ef4444,#f87171)'),
                            }}
                          />
                        </div>
                        <div className="text-[10px] text-gray-600 mt-1">of {formatAmount(client.priceQuoted)} total</div>
                      </div>
                    </td>

                    {/* Quick actions inline */}
                    <td className="px-6 py-4" onClick={e => e.stopPropagation()}>
                      <div className="min-w-[200px]">
                        <QuickPaymentUpdate
                          clientId={client.id}
                          currentAmount={client.amountPaid}
                          totalAmount={client.priceQuoted}
                        />
                      </div>
                    </td>

                    {/* Last activity */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5 text-xs">
                        <div className="text-gray-400 whitespace-nowrap">
                          <span className="text-gray-600">Updated: </span>{formatDate(new Date(client.updatedAt))}
                        </div>
                        {client.lastPayment && (
                          <div className="text-nexa-gold whitespace-nowrap">
                            <span className="text-gray-600">Paid: </span>{formatDate(new Date(client.lastPayment))}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Delete */}
                    <td className="px-4 py-4 text-right rtl:text-left" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => handleDelete(client.id)}
                        disabled={isLoading}
                        className="p-2 hover:bg-red-500/10 rounded-lg text-gray-600 hover:text-red-400 transition-colors border border-transparent hover:border-red-500/20 disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-gray-500">
                    <Search className="h-8 w-8 mx-auto mb-2 text-gray-700" />
                    <p>{t('no_clients_found')}</p>
                    <button onClick={clearFilters} className="mt-3 text-nexa-gold hover:underline text-sm">{t('clear_filters')}</button>
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
