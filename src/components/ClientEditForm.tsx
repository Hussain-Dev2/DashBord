'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Status } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { Pencil, Save, X, Trash2, Loader2 } from 'lucide-react'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useClients } from '@/contexts/ClientsContext'
import { toast } from 'sonner'

type Client = {
  id: string
  name: string
  industry: string | null
  phone: string | null
  logoUrl: string | null
  projectUrl: string | null
  repoUrl: string | null
  status: Status
  priceQuoted: number
  amountPaid: number
}

const inputCls = `
  w-full px-4 py-3 rounded-xl text-white text-sm font-medium
  bg-white/5 border border-white/10
  focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/15 focus:outline-none
  placeholder:text-gray-600 transition-all duration-200
  [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
`
const labelCls = 'block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2'

export function ClientEditForm({ client }: { client: Client }) {
  const router = useRouter()
  const { currency, exchangeRate } = useCurrency()
  const { updateClientFn, deleteClientFn } = useClients()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  const getInitialValues = () => {
    let pq = client.priceQuoted
    let ap = client.amountPaid
    if (currency === 'IQD') { pq = pq * exchangeRate; ap = ap * exchangeRate }
    return {
      name: client.name,
      industry: client.industry || '',
      phone: client.phone || '',
      logoUrl: client.logoUrl || '',
      projectUrl: client.projectUrl || '',
      repoUrl: client.repoUrl || '',
      status: client.status,
      priceQuoted: pq === 0 ? '' : pq.toFixed(0),
      amountPaid: ap === 0 ? '' : ap.toFixed(0),
    }
  }

  const [formData, setFormData] = useState(getInitialValues())

  useEffect(() => { if (isEditing) setFormData(getInitialValues()) }, [isEditing, currency])
  useEffect(() => { setMounted(true); return () => setMounted(false) }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      let priceQuoted = formData.priceQuoted ? parseFloat(formData.priceQuoted as string) : 0
      let amountPaid = formData.amountPaid ? parseFloat(formData.amountPaid as string) : 0
      if (currency === 'IQD') { priceQuoted = priceQuoted / exchangeRate; amountPaid = amountPaid / exchangeRate }
      await updateClientFn(client.id, { ...formData, priceQuoted, amountPaid })
      setIsEditing(false)
      router.refresh()
      toast.success('Client updated successfully')
    } catch {
      toast.error('Failed to update client')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete ${client.name}? This cannot be undone.`)) return
    setIsDeleting(true)
    try {
      await deleteClientFn(client.id)
      router.push('/admin')
    } catch {
      toast.error('Failed to delete client')
      setIsDeleting(false)
    }
  }

  // ── Trigger buttons (shown in header) ──
  if (!isEditing) {
    return (
      <div className="flex gap-2">
        <button
          onClick={() => setIsEditing(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95"
          style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-hover))', color: 'var(--slate-950)' }}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit Client
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold
            bg-red-500/10 text-red-400 border border-red-500/25
            hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-200
            disabled:opacity-50 hover:scale-105 active:scale-95"
        >
          {isDeleting
            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Deleting...</>
            : <><Trash2 className="h-3.5 w-3.5" /> Delete</>
          }
        </button>
      </div>
    )
  }

  // ── Modal ──
  const modal = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="w-full max-w-3xl my-8 rounded-2xl border border-white/10 shadow-2xl"
        style={{ background: 'rgba(14,16,30,0.97)', backdropFilter: 'blur(24px)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-white/8">
          <h2 className="text-2xl font-bold" style={{ background: 'linear-gradient(135deg, var(--gold), #fff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Edit Client
          </h2>
          <button
            onClick={() => setIsEditing(false)}
            className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Name (full width) */}
          <div className="md:col-span-2">
            <label className={labelCls}>Client Name <span className="text-red-400">*</span></label>
            <input type="text" value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className={inputCls} placeholder="e.g., TechCorp Solutions" />
          </div>

          <div>
            <label className={labelCls}>Industry</label>
            <input type="text" value={formData.industry}
              onChange={e => setFormData({ ...formData, industry: e.target.value })}
              className={inputCls} placeholder="e.g., E-Commerce" />
          </div>

          <div>
            <label className={labelCls}>Phone</label>
            <input type="text" value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className={inputCls} placeholder="+1234567890" />
          </div>

          <div>
            <label className={labelCls}>Status</label>
            <select value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as Status })}
              className={inputCls + ' cursor-pointer'}
              style={{ background: 'rgba(255,255,255,0.05)' }}
            >
              <option value="LEAD">LEAD</option>
              <option value="PENDING">PENDING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Price Quoted ({currency})</label>
            <input type="number" value={formData.priceQuoted}
              onChange={e => setFormData({ ...formData, priceQuoted: e.target.value })}
              className={inputCls} min="0" step="0.01" placeholder="0.00" />
          </div>

          <div>
            <label className={labelCls}>Amount Paid ({currency})</label>
            <input type="number" value={formData.amountPaid}
              onChange={e => setFormData({ ...formData, amountPaid: e.target.value })}
              className={inputCls} min="0" step="0.01" placeholder="0.00" />
          </div>

          <div>
            <label className={labelCls}>Logo URL</label>
            <input type="url" value={formData.logoUrl}
              onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
              className={inputCls} placeholder="https://example.com/logo.png" />
          </div>

          <div>
            <label className={labelCls}>Project URL</label>
            <input type="url" value={formData.projectUrl}
              onChange={e => setFormData({ ...formData, projectUrl: e.target.value })}
              className={inputCls} placeholder="https://project.com" />
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>Repository URL</label>
            <input type="url" value={formData.repoUrl}
              onChange={e => setFormData({ ...formData, repoUrl: e.target.value })}
              className={inputCls} placeholder="https://github.com/username/repo" />
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex gap-3 px-8 pb-8 pt-4 border-t border-white/8">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-hover))', color: 'var(--slate-950)', boxShadow: '0 4px 20px rgba(212,175,55,0.3)' }}
          >
            {isSaving
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
              : <><Save className="h-4 w-4" /> Save Changes</>
            }
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-gray-300
              bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200"
          >
            <X className="h-4 w-4" /> Cancel
          </button>
        </div>
      </div>
    </div>
  )

  return mounted ? createPortal(modal, document.body) : null
}
