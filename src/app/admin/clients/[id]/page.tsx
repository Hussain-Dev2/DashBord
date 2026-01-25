import { getClient, addNote, updateClientStatus } from '@/app/actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Phone, Github, Globe, FileText, Send, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { Status } from '@prisma/client'
import { formatCurrency, formatDateTime } from '@/lib/format'
import { ClientEditForm } from '@/components/ClientEditForm'
import { QuickPaymentUpdate } from '@/components/QuickPaymentUpdate'
import { PaymentHistory } from '@/components/PaymentHistory'
import { ClientsProvider } from '@/contexts/ClientsContext'
import { InteractionLog } from '@/components/InteractionLog'

// Helper for WhatsApp Link
function getWhatsAppLink(phone: string | null) {
  if (!phone) return '#'
  const numerics = phone.replace(/\D/g, '')
  return `https://wa.me/${numerics}`
}


export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const client = await getClient(id)
  
  if (!client) return notFound()

  const balance = (client.priceQuoted || 0) - (client.amountPaid || 0)
  const paymentProgress = client.priceQuoted > 0 ? (client.amountPaid / client.priceQuoted) * 100 : 0

  return (
    <ClientsProvider initialClients={[client as any]}>
      <div className="min-h-screen bg-gradient-to-br from-nexa-black via-nexa-black to-nexa-gray/30 text-white p-4 md:p-8">
        {/* Header with Glassmorphism */}
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 shadow-2xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <Link href="/admin" className="inline-flex items-center text-gray-400 hover:text-nexa-gold transition-all duration-300 group">
              <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
              <span className="font-medium">Back to Dashboard</span>
            </Link>
            <ClientEditForm client={client} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Profile & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 shadow-2xl hover:shadow-nexa-gold/20 transition-all duration-300">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="relative mb-4">
                  <div className="h-24 w-24 rounded-full bg-gradient-to-br from-nexa-gold to-nexa-goldHover flex items-center justify-center text-nexa-black text-3xl font-bold border-4 border-white/20 shadow-xl">
                    {client.logoUrl ? (
                      <img src={client.logoUrl} alt={client.name} className="h-full w-full object-cover rounded-full" />
                    ) : (
                      client.name.substring(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-green-500 rounded-full border-4 border-nexa-black"></div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
                  {client.name}
                </h1>
                <span className="text-sm text-gray-400 px-4 py-1 bg-white/5 rounded-full border border-white/10">
                  {client.industry || 'No Industry'}
                </span>
              </div>

              {/* Status Badge */}
              <div className="flex justify-center mb-6">
                <span className={`px-6 py-2 rounded-full text-sm font-semibold border-2 ${
                  client.status === 'ACTIVE' ? 'bg-green-500/20 text-green-400 border-green-500/50' :
                  client.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' :
                  client.status === 'SUSPENDED' ? 'bg-red-500/20 text-red-400 border-red-500/50' :
                  'bg-blue-500/20 text-blue-400 border-blue-500/50'
                }`}>
                  {client.status}
                </span>
              </div>

              {/* Financial Overview */}
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-nexa-gold/10 to-transparent border border-nexa-gold/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      Price Quoted
                    </span>
                    <span className="text-xl font-bold text-white">${formatCurrency(client.priceQuoted)}</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Amount Paid
                    </span>
                    <QuickPaymentUpdate 
                      clientId={client.id}
                      currentAmount={client.amountPaid || 0}
                      totalAmount={client.priceQuoted || 0}
                    />
                  </div>
                  {/* Progress Bar */}
                  <div className="mt-3">
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(paymentProgress, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{paymentProgress.toFixed(0)}% paid</p>
                  </div>
                </div>

                {balance > 0 && (
                  <div className="bg-gradient-to-r from-red-500/10 to-transparent border border-red-500/20 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Balance Due</span>
                      <span className="text-xl font-bold text-red-400">${formatCurrency(balance)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                {client.phone && (
                  <a 
                    href={getWhatsAppLink(client.phone)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white border border-green-400/50 rounded-xl transition-all duration-300 gap-2 font-medium shadow-lg hover:shadow-green-500/50"
                  >
                    <Phone className="h-4 w-4" /> Contact via WhatsApp
                  </a>
                )}
                {client.projectUrl && (
                  <a 
                    href={client.projectUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all duration-300 gap-2 font-medium"
                  >
                    <Globe className="h-4 w-4" /> View Live Site
                  </a>
                )}
                {client.repoUrl && (
                  <a 
                    href={client.repoUrl} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-full py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl transition-all duration-300 gap-2 font-medium"
                  >
                    <Github className="h-4 w-4" /> View Repository
                  </a>
                )}
              </div>
            </div>
            
            <PaymentHistory payments={client?.payments || []} />
          </div>

          {/* Right Column: Interaction Log */}
          <div className="lg:col-span-2">
            <InteractionLog clientId={client.id} initialNotes={client.notes || []} />
          </div>
        </div>
      </div>
    </ClientsProvider>
  )
}

