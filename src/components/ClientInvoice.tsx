'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Printer, X, FileText, CheckCircle2, AlertCircle, Clock,
  Plus, Trash2, Image as ImageIcon, RefreshCw, Package
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCurrency } from '@/contexts/CurrencyContext'
import { SerializedClient, InvoiceLineItem } from '@/lib/types'
import { formatDate } from '@/lib/format'
import html2canvas from 'html2canvas'
import { toast } from 'sonner'
import { useProducts } from '@/hooks/useProducts'
import { useCreateSubscription } from '@/hooks/useSubscriptions'
import type { BillingCycle } from '@/lib/types'

// ── Invoice Line Row ───────────────────────────────────────
function LineRow({
  item, index, products, onUpdate, onRemove
}: {
  item: InvoiceLineItem
  index: number
  products: { id: string; name: string; default_price: number; tax_rate: number }[]
  onUpdate: (index: number, updates: Partial<InvoiceLineItem>) => void
  onRemove: (index: number) => void
}) {
  const lineTotal = item.quantity * item.unit_price
  const taxAmount = lineTotal * (item.tax_rate / 100)

  const handleProductSelect = (productId: string) => {
    const p = products.find(p => p.id === productId)
    if (p) {
      onUpdate(index, {
        product_id: p.id,
        description: p.name,
        unit_price: p.default_price,
        tax_rate: p.tax_rate,
      })
    }
  }

  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2 border-b border-white/5 last:border-0">
      {/* Product selector */}
      <div className="col-span-12 sm:col-span-4">
        <select
          value={item.product_id || ''}
          onChange={e => handleProductSelect(e.target.value)}
          className="w-full bg-white/[0.02] border border-white/8 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-400/30 transition-colors"
        >
          <option value="">Custom item...</option>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {!item.product_id && (
          <input
            type="text"
            value={item.description}
            onChange={e => onUpdate(index, { description: e.target.value })}
            placeholder="Description"
            className="mt-1 w-full bg-white/[0.02] border border-white/8 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-amber-400/30 transition-colors placeholder:text-gray-700"
          />
        )}
      </div>
      {/* Qty */}
      <div className="col-span-3 sm:col-span-2">
        <input
          type="number"
          min="1"
          value={item.quantity}
          onChange={e => onUpdate(index, { quantity: Number(e.target.value) })}
          className="w-full bg-white/[0.02] border border-white/8 rounded-lg px-3 py-2 text-sm text-center text-white outline-none focus:border-amber-400/30 transition-colors"
        />
      </div>
      {/* Unit price */}
      <div className="col-span-4 sm:col-span-3 relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs">$</span>
        <input
          type="number"
          min="0"
          step="0.01"
          value={item.unit_price}
          onChange={e => onUpdate(index, { unit_price: Number(e.target.value) })}
          className="w-full pl-6 pr-3 py-2 bg-white/[0.02] border border-white/8 rounded-lg text-sm text-white outline-none focus:border-amber-400/30 transition-colors"
        />
      </div>
      {/* VAT */}
      <div className="col-span-3 sm:col-span-2 relative">
        <input
          type="number"
          min="0"
          max="100"
          value={item.tax_rate}
          onChange={e => onUpdate(index, { tax_rate: Number(e.target.value) })}
          className="w-full pr-6 pl-3 py-2 bg-white/[0.02] border border-white/8 rounded-lg text-sm text-white outline-none focus:border-amber-400/30 transition-colors"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 text-xs">%</span>
      </div>
      {/* Total + remove */}
      <div className="col-span-2 sm:col-span-1 flex items-center justify-end gap-2">
        <div className="text-right">
          <p className="text-xs font-bold text-white">${(lineTotal + taxAmount).toFixed(2)}</p>
          {item.tax_rate > 0 && (
            <p className="text-[10px] text-amber-400">+${taxAmount.toFixed(2)} VAT</p>
          )}
        </div>
        <button
          onClick={() => onRemove(index)}
          className="p-1 rounded-lg text-red-900/60 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────
export function ClientInvoice({ client }: { client: SerializedClient }) {
  const { t, language, dir }   = useLanguage()
  const { formatAmount }       = useCurrency()
  const { data: products = [] } = useProducts()
  const createSubscription      = useCreateSubscription()

  const [isOpen, setIsOpen]           = useState(false)
  const [mounted, setMounted]         = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('one_time')
  const invoiceRef = useRef<HTMLDivElement>(null)

  // Line items
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { description: 'Service', quantity: 1, unit_price: client.priceQuoted, tax_rate: 0 }
  ])

  useEffect(() => {
    setMounted(true)
    document.body.style.overflow = isOpen ? 'hidden' : 'unset'
    return () => { setMounted(false); document.body.style.overflow = 'unset' }
  }, [isOpen])

  // Calculations
  const subtotal    = lineItems.reduce((s, l) => s + l.quantity * l.unit_price, 0)
  const totalVAT    = lineItems.reduce((s, l) => s + l.quantity * l.unit_price * (l.tax_rate / 100), 0)
  const grandTotal  = subtotal + totalVAT

  const amountPaid  = client.amountPaid
  const balance     = grandTotal - amountPaid
  const isFullyPaid = balance <= 0
  const isUnpaid    = amountPaid === 0

  const addLine = () => setLineItems(prev => [...prev, { description: '', quantity: 1, unit_price: 0, tax_rate: 0 }])
  const updateLine = (index: number, updates: Partial<InvoiceLineItem>) =>
    setLineItems(prev => prev.map((item, i) => i === index ? { ...item, ...updates } : item))
  const removeLine = (index: number) =>
    setLineItems(prev => prev.filter((_, i) => i !== index))

  const handlePrint = () => window.print()

  const captureImage = async () => {
    if (!invoiceRef.current) return null
    try {
      setIsCapturing(true)
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#ffffff', logging: false,
      })
      setIsCapturing(false)
      return canvas.toDataURL('image/png')
    } catch (err) {
      console.error('Snapshot error:', err)
      setIsCapturing(false)
      toast.error('Failed to generate image')
      return null
    }
  }

  const handleDownloadImage = async () => {
    const dataUrl = await captureImage()
    if (dataUrl) {
      const link = document.createElement('a')
      link.download = `Invoice-${client.name}.png`
      link.href = dataUrl
      link.click()
      toast.success('Saved as PNG')
    }
  }

  const handleWhatsAppShare = async () => {
    toast.info('Preparing invoice...')
    const message = `Hello ${client.name}, here is your invoice summary from Nexa Digital:\n\n` +
      `• Subtotal: ${formatAmount(subtotal)}\n` +
      (totalVAT > 0 ? `• VAT: ${formatAmount(totalVAT)}\n` : '') +
      `• Grand Total: ${formatAmount(grandTotal)}\n` +
      `• Amount Paid: ${formatAmount(amountPaid)}\n` +
      `• Balance Due: ${formatAmount(balance)}\n\n` +
      `Status: ${isFullyPaid ? 'Fully Paid' : isUnpaid ? 'Unpaid' : 'Partially Paid'}\n\nThank you!`

    const dataUrl = await captureImage()
    if (dataUrl) {
      const link = document.createElement('a')
      link.download = `Invoice-${client.name}.png`
      link.href = dataUrl
      link.click()
      toast.success('Image downloaded! Attach it in WhatsApp.')
    }
    setTimeout(() => {
      const phoneNumber = client.phone?.replace(/[^0-9]/g, '') || ''
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank')
    }, 1000)
  }

  const handleCreateSubscription = async () => {
    if (billingCycle === 'one_time') return
    try {
      await createSubscription.mutateAsync({
        client_id: client.id,
        billing_cycle: billingCycle,
        price: grandTotal,
      })
      toast.success(`Subscription created — ${billingCycle} at ${formatAmount(grandTotal)}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create subscription')
    }
  }

  const invoiceContent = (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 overflow-hidden print:static print:bg-white print:p-0 invoice-overlay">
      <div className="bg-[#0d0f1a] border border-white/10 w-full max-w-[1000px] max-h-[92vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative print:static print:p-0 print:border-none invoice-modal">

        {/* Control bar */}
        <div className="w-full bg-white/5 border-b border-white/10 p-4 flex justify-between items-center z-10 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <FileText className="h-4 w-4 text-amber-400" />
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-sm block leading-none">Invoice</span>
              <span className="text-gray-600 text-xs">{client.name}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadImage} disabled={isCapturing}
              className="flex items-center gap-1.5 px-3 py-2 bg-white/5 text-white border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all disabled:opacity-50">
              <ImageIcon className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden lg:inline">Image</span>
            </button>
            <button onClick={handleWhatsAppShare} disabled={isCapturing}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-xl text-xs font-bold hover:bg-[#25D366]/20 transition-all disabled:opacity-50">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.319 1.592 5.548 0 10.064-4.516 10.066-10.066.002-2.686-1.047-5.212-2.952-7.115-1.907-1.903-4.432-2.952-7.118-2.953-5.556 0-10.069 4.513-10.071 10.069-.001 2.105.549 4.158 1.593 5.969l-1.011 3.693 3.79-1.011z"/></svg>
              <span className="hidden md:inline">WhatsApp</span>
            </button>
            <button onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition-all shadow-lg active:scale-95">
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button onClick={() => setIsOpen(false)}
              className="p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-white/10 rounded-xl transition-all">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
          {/* ── Left: Editor panel ─────────────────── */}
          <div className="lg:w-80 shrink-0 border-r border-white/8 bg-white/[0.01] overflow-y-auto print:hidden">
            <div className="p-5 space-y-5">
              {/* Line items editor */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Line Items</p>
                  <button onClick={addLine}
                    className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold transition-colors">
                    <Plus className="h-3 w-3" />
                    Add
                  </button>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-12 gap-1 mb-1 px-1">
                  <span className="col-span-12 sm:col-span-4 text-[10px] text-gray-700 uppercase tracking-widest">Item</span>
                  <span className="col-span-3 sm:col-span-2 text-[10px] text-gray-700 uppercase tracking-widest text-center">Qty</span>
                  <span className="col-span-4 sm:col-span-3 text-[10px] text-gray-700 uppercase tracking-widest">Price</span>
                  <span className="col-span-3 sm:col-span-2 text-[10px] text-gray-700 uppercase tracking-widest">VAT%</span>
                  <span className="col-span-2 sm:col-span-1 text-[10px] text-gray-700 uppercase tracking-widest text-right">Total</span>
                </div>

                {lineItems.map((item, i) => (
                  <LineRow
                    key={i}
                    item={item}
                    index={i}
                    products={products}
                    onUpdate={updateLine}
                    onRemove={removeLine}
                  />
                ))}

                {products.length === 0 && (
                  <div className="flex items-center gap-2 mt-2 p-3 rounded-xl bg-white/[0.02] border border-dashed border-white/8">
                    <Package className="h-3.5 w-3.5 text-gray-600 shrink-0" />
                    <p className="text-xs text-gray-600">No products yet. Add via the Product Catalog.</p>
                  </div>
                )}
              </div>

              {/* Billing cycle (Subscription toggle) */}
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Billing Type</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['one_time', 'monthly', 'yearly'] as BillingCycle[]).map(cycle => (
                    <button
                      key={cycle}
                      onClick={() => setBillingCycle(cycle)}
                      className={`py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                        billingCycle === cycle
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-white/[0.02] border border-white/8 text-gray-600 hover:text-gray-300'
                      }`}
                    >
                      {cycle.replace('_', ' ')}
                    </button>
                  ))}
                </div>
                {billingCycle !== 'one_time' && (
                  <div className="mt-3">
                    <button
                      onClick={handleCreateSubscription}
                      disabled={createSubscription.isPending}
                      className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                    >
                      {createSubscription.isPending ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                      Create {billingCycle} subscription
                    </button>
                    <p className="text-[10px] text-gray-600 text-center mt-1.5">
                      Auto-billing will be set up for {formatAmount(grandTotal)}/{billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </p>
                  </div>
                )}
              </div>

              {/* Totals summary */}
              <div className="rounded-xl bg-white/[0.02] border border-white/8 p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="text-white font-semibold">{formatAmount(subtotal)}</span>
                </div>
                {totalVAT > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-400">VAT</span>
                    <span className="text-amber-400 font-semibold">+{formatAmount(totalVAT)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs border-t border-white/8 pt-2">
                  <span className="text-gray-400 font-bold">Grand Total</span>
                  <span className="text-white font-black">{formatAmount(grandTotal)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-500">Paid</span>
                  <span className="text-emerald-400 font-semibold">−{formatAmount(amountPaid)}</span>
                </div>
                <div className={`flex justify-between text-sm font-black pt-1 border-t border-white/8 ${balance > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  <span>Balance Due</span>
                  <span>{formatAmount(Math.max(0, balance))}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Print-ready invoice ─────────── */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center items-start print:static print:p-0 print:overflow-visible bg-gray-100">
            <div
              id="printable-area"
              ref={invoiceRef}
              className="bg-white text-black w-full max-w-[750px] min-h-[1000px] shadow-2xl relative flex flex-col print:shadow-none print:w-full print:min-h-0 border-t-[10px]"
              style={{ borderTopColor: '#D4AF37' }}
            >
              <div className="p-8 md:p-10 flex-1 flex flex-col" dir={dir}>

                {/* Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02]">
                  <h1 className="text-[100px] font-black -rotate-45 uppercase">Nexa Digital</h1>
                </div>

                {/* Header */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="h-14 w-14 bg-[#0d0f1a] flex items-center justify-center rounded-xl shadow-xl rotate-3">
                      <span className="text-[#D4AF37] text-2xl font-black">N</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-black uppercase text-[#0d0f1a]">Nexa Digital</h1>
                      <p className="text-[10px] text-[#D4AF37] font-bold tracking-[0.2em] uppercase">Creative Tech Studio</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-black text-[#0d0f1a] uppercase">Invoice</h2>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(new Date())}</p>
                    <p className="text-xs font-mono text-gray-500">#{client.id.substring(0, 8).toUpperCase()}</p>
                  </div>
                </div>

                {/* Bill To + Status */}
                <div className="grid grid-cols-2 gap-5 mb-7 relative z-10">
                  <div className="bg-gray-50 p-4 rounded-xl border-l-4" style={{ borderLeftColor: '#D4AF37' }}>
                    <h3 className="text-[9px] font-black uppercase text-gray-400 mb-1.5 tracking-[0.2em]">Bill To</h3>
                    <p className="text-lg font-black text-[#0d0f1a]">{client.name}</p>
                    <p className="text-xs text-gray-500">{client.industry || 'Client'}</p>
                    {client.phone && <p className="text-xs font-mono text-gray-700 mt-1.5">{client.phone}</p>}
                  </div>
                  <div className="flex flex-col items-end justify-center">
                    <div className={`px-5 py-2 rounded-xl font-black text-sm ${
                      isFullyPaid ? 'bg-green-50 text-green-700' :
                      isUnpaid   ? 'bg-red-50 text-red-700' :
                      'bg-amber-50 text-amber-700'
                    }`}>
                      {isFullyPaid ? '✓ Fully Paid' : isUnpaid ? '✗ Unpaid' : '◑ Partially Paid'}
                    </div>
                    {billingCycle !== 'one_time' && (
                      <span className="mt-2 text-[10px] font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-lg capitalize">
                        {billingCycle} subscription
                      </span>
                    )}
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="mb-6 relative z-10 overflow-hidden rounded-xl border border-gray-100">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#0d0f1a] text-white text-[9px] font-black uppercase tracking-widest">
                        <th className="px-4 py-3 text-left">Description</th>
                        <th className="px-4 py-3 text-center">Qty</th>
                        <th className="px-4 py-3 text-right">Unit Price</th>
                        <th className="px-4 py-3 text-right">VAT</th>
                        <th className="px-4 py-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {lineItems.map((item, i) => {
                        const lineSubtotal = item.quantity * item.unit_price
                        const lineVAT = lineSubtotal * (item.tax_rate / 100)
                        return (
                          <tr key={i}>
                            <td className="px-4 py-3 text-sm font-medium text-[#0d0f1a]">
                              {item.description || '(no description)'}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-600">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-600">${item.unit_price.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right text-amber-600">
                              {item.tax_rate > 0 ? `${item.tax_rate}%` : '—'}
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-[#0d0f1a]">
                              ${(lineSubtotal + lineVAT).toFixed(2)}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      {totalVAT > 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-2 text-right text-xs text-gray-500 font-semibold">Subtotal</td>
                          <td className="px-4 py-2 text-right text-sm font-bold">${subtotal.toFixed(2)}</td>
                        </tr>
                      )}
                      {totalVAT > 0 && (
                        <tr>
                          <td colSpan={4} className="px-4 py-2 text-right text-xs text-amber-600 font-semibold">VAT</td>
                          <td className="px-4 py-2 text-right text-sm font-bold text-amber-600">+${totalVAT.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="bg-[#0d0f1a] text-white">
                        <td colSpan={4} className="px-4 py-4 text-sm font-black uppercase tracking-tight">Grand Total</td>
                        <td className="px-4 py-4 text-right text-xl font-black">${grandTotal.toFixed(2)}</td>
                      </tr>
                      <tr className="bg-green-50">
                        <td colSpan={4} className="px-4 py-2 text-right text-xs text-green-700 font-semibold">Amount Paid</td>
                        <td className="px-4 py-2 text-right text-sm font-bold text-green-700">−${amountPaid.toFixed(2)}</td>
                      </tr>
                      <tr className={balance > 0 ? 'bg-red-50' : 'bg-green-50'}>
                        <td colSpan={4} className={`px-4 py-3 text-right text-sm font-black ${balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                          Balance Due
                        </td>
                        <td className={`px-4 py-3 text-right text-lg font-black ${balance > 0 ? 'text-red-700' : 'text-green-700'}`}>
                          ${Math.max(0, balance).toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Footer */}
                <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-end relative z-10">
                  <p className="text-[9px] text-gray-400 max-w-[200px] leading-tight">
                    Generated by Nexa Digital CMS. This is an official financial summary.
                  </p>
                  <div className="text-center">
                    <div className="w-36 h-14 border-2 border-dashed border-gray-100 rounded-xl mb-1.5 flex items-center justify-center">
                      <span className="text-[8px] text-gray-300 font-bold uppercase tracking-widest">Authorized</span>
                    </div>
                    <p className="text-xs font-bold text-[#0d0f1a]">Authorized Signature</p>
                  </div>
                </div>

                <div className="mt-5 bg-[#0d0f1a] p-2.5 rounded-lg">
                  <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest text-center">
                    © {new Date().getFullYear()} Nexa Digital Inc.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          @page { size: a4; margin: 0; }
          body { visibility: hidden !important; background: white !important; }
          .invoice-root, .invoice-root * { visibility: visible !important; }
          .invoice-root { position: absolute !important; left: 0; top: 0; z-index: 99999; }
          .invoice-overlay, .invoice-modal { position: static !important; background: white !important; border: none; box-shadow: none; display: block; width: 100%; }
          #printable-area { width: 100% !important; }
          .print\\:hidden { display: none !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        }
      `}</style>
    </div>
  )

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 text-white border-2 border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all hover:scale-105 active:scale-95 group"
      >
        <Printer className="h-4 w-4 text-amber-400 group-hover:scale-110 transition-transform" />
        <span className="group-hover:text-amber-300 transition-colors">{t('generate_invoice')}</span>
      </button>

      {isOpen && mounted && createPortal(
        <div className="invoice-root">{invoiceContent}</div>,
        document.body
      )}
    </>
  )
}
