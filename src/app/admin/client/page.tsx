'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Phone, Github, Globe, DollarSign, TrendingUp, TrendingDown, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { ClientEditForm } from '@/components/ClientEditForm'
import { QuickPaymentUpdate } from '@/components/QuickPaymentUpdate'
import { PaymentHistory } from '@/components/PaymentHistory'
import { ClientsProvider, useClients } from '@/contexts/ClientsContext'
import { InteractionLog } from '@/components/InteractionLog'
import { ClientInvoice } from '@/components/ClientInvoice'
import { Suspense, useEffect, useState } from 'react'

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

function ClientDetailsContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const { clients, isLoading } = useClients()
  const [client, setClient] = useState<any>(null)

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

  const balance = Math.max(0, (client.priceQuoted || 0) - (client.amountPaid || 0))
  const isFullyPaid = balance <= 0.01
  const paymentProgress = client.priceQuoted > 0
    ? Math.min(100, (client.amountPaid / client.priceQuoted) * 100)
    : 0
  const statusStyle = statusStyles[client.status] || statusStyles.LEAD
  const initials = client.name.substring(0, 2).toUpperCase()

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
                  {/* Online dot */}
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
                {/* Total Debt */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--gold)]/8 border border-[var(--gold)]/20">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <DollarSign className="h-4 w-4 text-[var(--gold)]" />
                    Total Debt
                  </div>
                  <span className="text-base font-bold text-white">${formatCurrency(client.priceQuoted)}</span>
                </div>

                {/* Amount Paid */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-green-500/8 border border-green-500/20">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <TrendingDown className="h-4 w-4 text-green-400" />
                    Paid
                  </div>
                  <span className="text-base font-bold text-green-400">${formatCurrency(client.amountPaid)}</span>
                </div>

                {/* Balance Due / Paid badge */}
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
                    className="flex items-center justify-center w-full py-3 rounded-xl font-bold text-sm gap-2 transition-all duration-200
                      bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25"
                  >
                    <Phone className="h-4 w-4" /> Contact via WhatsApp
                  </a>
                )}
                {client.projectUrl && (
                  <a
                    href={client.projectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-2.5 rounded-xl font-medium text-sm gap-2 transition-all duration-200
                      bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
                  >
                    <Globe className="h-4 w-4" /> View Live Site
                  </a>
                )}
                {client.repoUrl && (
                  <a
                    href={client.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-2.5 rounded-xl font-medium text-sm gap-2 transition-all duration-200
                      bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
                  >
                    <Github className="h-4 w-4" /> View Repository
                  </a>
                )}
              </div>
            </div>

            {/* Payment History */}
            <PaymentHistory payments={client?.payments || []} />
          </div>

          {/* ── Right Column ── */}
          <div className="lg:col-span-2">
            <InteractionLog clientId={client.id} initialNotes={client.notes || []} />
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
