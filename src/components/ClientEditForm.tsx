'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Status } from '@prisma/client'
import { updateClient, deleteClient } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { Pencil, Save, X, Trash2, Loader2 } from 'lucide-react'

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

// Helper to convert number to string for input, but keep 0 as 0 if user explicitly typed it? 
// Actually for edit form, we usually WANT to show the current value (e.g. 500). 
// But if it is 0, we might want to show "0" or empty? 
// The user complaint was "cant add number i must delele the zero".
// This implies when they see "0", they click and type "5" and get "05" or have to backspace.
// So if the value is 0, we should probably show "" or allow them to clear it easily.
// Let's use string state to allow empty string.

export function ClientEditForm({ client }: { client: Client }) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    name: client.name,
    industry: client.industry || '',
    phone: client.phone || '',
    logoUrl: client.logoUrl || '',
    projectUrl: client.projectUrl || '',
    repoUrl: client.repoUrl || '',
    status: client.status,
    priceQuoted: client.priceQuoted === 0 ? '' : client.priceQuoted.toString(),
    amountPaid: client.amountPaid === 0 ? '' : client.amountPaid.toString(),
  })

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateClient(client.id, {
        ...formData,
        priceQuoted: formData.priceQuoted ? parseFloat(formData.priceQuoted as string) : 0,
        amountPaid: formData.amountPaid ? parseFloat(formData.amountPaid as string) : 0,
      })
      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error('Failed to update client:', error)
      alert('Failed to update client')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
      return
    }
    
    setIsDeleting(true)
    try {
      await deleteClient(client.id)
      router.push('/admin')
    } catch (error) {
      console.error('Failed to delete client:', error)
      alert('Failed to delete client')
      setIsDeleting(false)
    }
  }

  if (!isEditing) {
    return (
      <div className="flex gap-3">
        <button
          onClick={() => {
            setIsEditing(true)
            // Reset form data when opening edit to ensure fresh state
             setFormData({
                name: client.name,
                industry: client.industry || '',
                phone: client.phone || '',
                logoUrl: client.logoUrl || '',
                projectUrl: client.projectUrl || '',
                repoUrl: client.repoUrl || '',
                status: client.status,
                priceQuoted: client.priceQuoted === 0 ? '' : client.priceQuoted.toString(),
                amountPaid: client.amountPaid === 0 ? '' : client.amountPaid.toString(),
              })
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-nexa-gold to-nexa-goldHover text-nexa-black rounded-xl font-semibold hover:shadow-lg hover:shadow-nexa-gold/50 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Pencil className="h-4 w-4" />
          Edit Client
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600/20 text-red-400 border-2 border-red-600/50 rounded-xl font-semibold hover:bg-red-600/30 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95"
        >
          {isDeleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <Trash2 className="h-4 w-4" />
              Delete
            </>
          )}
        </button>
      </div>
    )
  }

  const modalContent = (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto">
      <div className="bg-gradient-to-br from-nexa-gray to-nexa-black border-2 border-white/20 rounded-2xl p-8 max-w-4xl w-full my-8 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-nexa-gold to-white bg-clip-text text-transparent">
            Edit Client
          </h2>
          <button
            onClick={() => {
              setIsEditing(false)
            }}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Client Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300"
              required
            />
          </div>

          {/* Industry */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Industry</label>
            <input
              type="text"
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300"
              placeholder="e.g., E-Commerce"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Phone</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300"
              placeholder="+1234567890"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300"
            >
              <option value="LEAD">LEAD</option>
              <option value="PENDING">PENDING</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="SUSPENDED">SUSPENDED</option>
            </select>
          </div>

          {/* Price Quoted */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Price Quoted ($)</label>
            <input
              type="number"
              value={formData.priceQuoted}
              onChange={(e) => setFormData({ ...formData, priceQuoted: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          {/* Amount Paid */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Amount Paid ($)</label>
            <input
              type="number"
              value={formData.amountPaid}
              onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Logo URL</label>
            <input
              type="url"
              value={formData.logoUrl}
              onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300"
              placeholder="https://example.com/logo.png"
            />
          </div>

          {/* Project URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">Project URL</label>
            <input
              type="url"
              value={formData.projectUrl}
              onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300"
              placeholder="https://project.com"
            />
          </div>

          {/* Repository URL */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-300 mb-2">Repository URL</label>
            <input
              type="url"
              value={formData.repoUrl}
              onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
              className="w-full px-4 py-3 bg-nexa-black/50 border-2 border-white/10 rounded-xl text-white placeholder-gray-500 focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 transition-all duration-300"
              placeholder="https://github.com/username/repo"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-8 border-t border-white/10 mt-8">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-nexa-gold to-nexa-goldHover text-nexa-black rounded-xl font-semibold hover:shadow-lg hover:shadow-nexa-gold/50 transition-all duration-300 disabled:opacity-50 hover:scale-105 active:scale-95"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIsEditing(false)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white border-2 border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 hover:scale-105 active:scale-95"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  )

  return mounted ? createPortal(modalContent, document.body) : null
}
