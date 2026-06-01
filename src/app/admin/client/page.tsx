'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Phone, Github, Globe, DollarSign,
  TrendingUp, TrendingDown, CheckCircle2,
  RefreshCw, X, BadgeCheck, Clock, Ban,
  Plus, FileText, StickyNote
} from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { ClientEditForm } from '@/components/ClientEditForm'
import { QuickPaymentUpdate } from '@/components/QuickPaymentUpdate'
import { PaymentHistory } from '@/components/PaymentHistory'
import { ClientsProvider, useClients } from '@/contexts/ClientsContext'
import { InteractionLog } from '@/components/InteractionLog'
import { ClientInvoice } from '@/components/ClientInvoice'
import { Suspense, useEffect, useState } from 'react'
import { useSubscriptions, useCancelSubscription, useCreateSubscription } from '@/hooks/useSubscriptions'
import type { Subscription, BillingCycle } from '@/lib/types'
import { toast } from 'sonner'

function getWhatsAppLink(phone: string | null) {
  if (!phone) return '#'
  const numerics = phone.replace(/\D/g, '')
  return `whatsapp://send?phone=${numerics}`
}

const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
  ACTIVE:    { bg: 'bg-green-500/15',  text: 'text-green-400',  border: 'border-green-500/30' },
  PENDING:   { bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  SUSPENDED: { bg: 'bg-red-500/15',    text: 'text-red-400',    border: 'border-red-500/30' },
  LEAD:      { bg: 'bg-blue-500/15',   text: 'text-blue-400',   border: 'border-blue-500/30' },
}

const SUB_STATUS_STYLES: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  active:   { icon: BadgeCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
  past_due: { icon: Clock,      color: 'text-amber-400',   bg: 'bg-amber-500/10 border-amber-500/20' },
  canceled: { icon: Ban,        color: 'text-gray-500',    bg: 'bg-white/5 border-white/10' },
  unpaid:   { icon: TrendingDown, color: 'text-red-400',   bg: 'bg-red-500/10 border-red-500/20' },
}

function formatDateShort(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

// ── Subscriptions Tab ──────────────────────────────────────
function SubscriptionsTab({ clientId }: { clientId: string }) {
  const { data: subscriptions = [], isLoading, refetch } = useSubscriptions(clientId)
  const cancelSub   = useCancelSubscription()
  const createSub   = useCreateSubscription()
  const [showNew, setShowNew] = useState(false)

  // New subscription form state
  const [cycle, setCycle] = useState<BillingCycle>('monthly')
  const [price, setPrice] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!price || Number(price) <= 0) { toast.error('Price must be positive'); return }
    try {
      await createSub.mutateAsync({ client_id: clientId, billing_cycle: cycle, price: Number(price) })
      toast.success(`${cycle} subscription created`)
      setShowNew(false)
      setPrice('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create subscription')
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await cancelSub.mutateAsync(id)
      toast.success('Subscription canceled')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to cancel')
    }
  }

  return (
    <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/8 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Subscriptions</h3>
          <p className="text-xs text-gray-600 mt-0.5">Recurring billing cycles for this client</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-500 hover:text-white transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowNew(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
            style={{ background: 'linear-gradient(135deg, #D4AF37, #b8961e)', color: '#0d0f1a' }}
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
        </div>
      </div>

      {/* New subscription form (inline) */}
      {showNew && (
        <form onSubmit={handleCreate} className="px-5 py-4 border-b border-white/8 bg-white/[0.01] space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">New Subscription</p>
          <div className="grid grid-cols-3 gap-2">
            {(['one_time', 'monthly', 'yearly'] as BillingCycle[]).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCycle(c)}
                className={`py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                  cycle === c
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-white/[0.03] border border-white/8 text-gray-500 hover:text-gray-300'
                }`}
              >
                {c.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="Amount per cycle"
              className="w-full pl-8 pr-4 py-2.5 bg-white/[0.03] border border-white/8 rounded-xl text-white text-sm outline-none focus:border-amber-400/40 transition-colors placeholder:text-gray-700"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={createSub.isPending}
              className="flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
              style={{ background: 'linear-gradient(135deg, #D4AF37, #b8961e)', color: '#0d0f1a' }}
            >
              {createSub.isPending ? 'Creating…' : 'Create Subscription'}
            </button>
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/8 text-gray-500 hover:text-white transition-all"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Subscription list */}
      {isLoading ? (
        <div className="p-6 space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      ) : subscriptions.length === 0 ? (
        <div className="p-10 text-center">
          <RefreshCw className="h-8 w-8 text-gray-700 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No subscriptions yet</p>
          <p className="text-gray-700 text-xs mt-1">Create one to enable recurring billing.</p>
        </div>
      ) : (
        <div className="divide-y divide-white/5">
          {subscriptions.map((sub: Subscription) => {
            const style = SUB_STATUS_STYLES[sub.status] ?? SUB_STATUS_STYLES.unpaid
            const StatusIcon = style.icon
            return (
              <div key={sub.id} className="px-5 py-4 flex items-center gap-3">
                {/* Status icon */}
                <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${style.bg}`}>
                  <StatusIcon className={`h-4 w-4 ${style.color}`} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white capitalize">
                      {sub.billing_cycle.replace('_', ' ')}
                    </span>
                    {sub.product && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-500">
                        {sub.product.name}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-600">
                      Started {formatDateShort(sub.start_date)}
                    </span>
                    {sub.next_billing_date && sub.status === 'active' && (
                      <>
                        <span className="text-gray-700">·</span>
                        <span className="text-xs text-amber-400/80">
                          Next: {formatDateShort(sub.next_billing_date)}
                        </span>
                      </>
                    )}
                    {sub.canceled_at && (
                      <>
                        <span className="text-gray-700">·</span>
                        <span className="text-xs text-red-400/60">
                          Canceled {formatDateShort(sub.canceled_at)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Price */}
                <div className="shrink-0 text-right mr-2">
                  <p className="text-sm font-black text-white">${formatCurrency(sub.price)}</p>
                  <p className="text-[10px] text-gray-600">
                    {sub.billing_cycle === 'monthly' ? '/mo' : sub.billing_cycle === 'yearly' ? '/yr' : 'one-time'}
                  </p>
                </div>

                {/* Cancel button (active only) */}
                {sub.status === 'active' && (
                  <button
                    onClick={() => handleCancel(sub.id)}
                    disabled={cancelSub.isPending}
                    className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
                    title="Cancel subscription"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Tab Types ──────────────────────────────────────────────
type Tab = 'activity' | 'subscriptions'

// ── Client Details Content ─────────────────────────────────
function ClientDetailsContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const { clients, isLoading } = useClients()
  const [client, setClient] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<Tab>('activity')

  useEffect(() => {
    if (id && clients.length > 0) {
      setClient(clients.find(c => c.id === id) || null)
    }
  }, [id, clients])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--slate-950)' }}>
        <div className="text-white/50 animate-pulse">Loading client data...</div>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--slate-950)' }}>
        <div className="glass-panel rounded-2xl p-8 text-center">
          <p className="text-white mb-4">Client not found.</p>
          <Link href="/admin" className="text-[var(--gold)] hover:underline text-sm">← Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  const balance         = Math.max(0, (client.priceQuoted || 0) - (client.amountPaid || 0))
  const isFullyPaid     = balance <= 0.01
  const paymentProgress = client.priceQuoted > 0
    ? Math.min(100, (client.amountPaid / client.priceQuoted) * 100)
    : 0
  const statusStyle = statusStyles[client.status] || statusStyles.LEAD
  const initials    = client.name.substring(0, 2).toUpperCase()

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: 'activity',      label: 'Activity',      icon: StickyNote  },
    { key: 'subscriptions', label: 'Subscriptions', icon: RefreshCw   },
  ]

  return (
    <div className="min-h-screen text-white pb-24 md:pb-10" style={{ background: 'var(--slate-950)' }}>
      {/* Sticky Header */}
      <header className="sticky top-0 z-30 glass-panel border-b border-white/8 px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-[var(--gold)] transition-colors text-sm font-medium group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-2">
            <ClientInvoice client={client as any} />
            <ClientEditForm client={client} />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left Column ── */}
          <div className="lg:col-span-1 space-y-5">
            {/* Profile Card */}
            <div className="glass-panel rounded-2xl p-6 border border-white/10">
              {/* Avatar + Name */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  <div
                    className="h-20 w-20 rounded-2xl flex items-center justify-center text-2xl font-bold border-2 border-white/20 shadow-xl overflow-hidden"
                    style={{ background: 'linear-gradient(135deg, var(--gold), #b8922a)' }}
                  >
                    {client.logoUrl ? (
                      <img src={client.logoUrl} alt={client.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-black">{initials}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-[3px] border-[var(--slate-950)]" />
                </div>
                <h1 className="text-xl font-bold text-white mb-1">{client.name}</h1>
                <span className="text-xs text-gray-400 px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  {client.industry || 'No Industry'}
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center mb-5">
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}>
                  {client.status}
                </span>
              </div>

              {/* Financial overview */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--gold)]/8 border border-[var(--gold)]/20">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <DollarSign className="h-4 w-4 text-[var(--gold)]" />
                    Total Debt
                  </div>
                  <span className="text-base font-bold text-white">${formatCurrency(client.priceQuoted)}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/8 border border-green-500/20">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <TrendingDown className="h-4 w-4 text-green-400" />
                    Paid
                  </div>
                  <span className="text-base font-bold text-green-400">${formatCurrency(client.amountPaid)}</span>
                </div>

                {isFullyPaid ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-1.5 text-sm text-green-400">
                      <CheckCircle2 className="h-4 w-4" /> Fully Paid
                    </div>
                    <span className="text-xs font-bold text-green-400 px-2 py-0.5 rounded-full bg-green-500/20">✓ PAID</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-500/8 border border-red-500/20">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <TrendingUp className="h-4 w-4 text-red-400" />
                      Balance Due
                    </div>
                    <span className="text-base font-bold text-red-400">${formatCurrency(balance)}</span>
                  </div>
                )}

                {/* Progress bar */}
                <div className="pt-1">
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>Payment progress</span>
                    <span>{paymentProgress.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-white/8 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${paymentProgress}%`,
                        background: isFullyPaid
                          ? 'var(--success)'
                          : paymentProgress > 50
                            ? 'var(--gold)'
                            : 'var(--danger)'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-4 pt-4 border-t border-white/8">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-3">Quick Actions</p>
                <QuickPaymentUpdate
                  clientId={client.id}
                  currentAmount={client.amountPaid || 0}
                  totalAmount={client.priceQuoted || 0}
                />
              </div>

              {/* Contact buttons */}
              <div className="mt-4 space-y-2">
                {client.phone && (
                  <a
                    href={getWhatsAppLink(client.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-3 rounded-xl font-bold text-sm gap-2 transition-all
                      bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25"
                  >
                    <Phone className="h-4 w-4" /> Contact via WhatsApp
                  </a>
                )}
                {client.projectUrl && (
                  <a href={client.projectUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-2.5 rounded-xl font-medium text-sm gap-2
                      bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-all">
                    <Globe className="h-4 w-4" /> View Live Site
                  </a>
                )}
                {client.repoUrl && (
                  <a href={client.repoUrl} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-2.5 rounded-xl font-medium text-sm gap-2
                      bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10 transition-all">
                    <Github className="h-4 w-4" /> View Repository
                  </a>
                )}
              </div>
            </div>

            {/* Payment History */}
            <PaymentHistory payments={client?.payments || []} />
          </div>

          {/* ── Right Column with Tabs ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tab switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/8 w-fit">
              {tabs.map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                      activeTab === tab.key
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                )
              })}
            </div>

            {/* Tab panels */}
            {activeTab === 'activity' && (
              <InteractionLog clientId={client.id} initialNotes={client.notes || []} />
            )}

            {activeTab === 'subscriptions' && (
              <SubscriptionsTab clientId={client.id} />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function ClientPage() {
  return (
    <ClientsProvider>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--slate-950)' }}>
            <div className="text-white/50 animate-pulse">Loading...</div>
          </div>
        }
      >
        <ClientDetailsContent />
      </Suspense>
    </ClientsProvider>
  )
}
