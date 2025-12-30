'use client'

import { useState } from 'react'
import { createClient } from '@/app/actions'
import { useRouter } from 'next/navigation'
import { X, Plus } from 'lucide-react'

export function CreateClientModal() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    phone: '',
    logoUrl: '',
    projectUrl: '',
    repoUrl: '',
    priceQuoted: 0,
    amountPaid: 0,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await createClient(formData)
      setIsOpen(false)
      setFormData({
        name: '',
        industry: '',
        phone: '',
        logoUrl: '',
        projectUrl: '',
        repoUrl: '',
        priceQuoted: 0,
        amountPaid: 0,
      })
      router.refresh()
    } catch (error) {
      console.error('Failed to create client:', error)
      alert('Failed to create client')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-nexa-gold to-nexa-goldHover text-nexa-black px-6 py-3 rounded-xl font-semibold hover:shadow-2xl hover:shadow-nexa-gold/30 transition-all duration-300 flex items-center gap-2 hover:scale-105 active:scale-95"
      >
        <Plus className="h-5 w-5" />
        Add New Client
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-nexa-gray border border-white/10 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Add New Client</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Client Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-nexa-black border border-white/10 rounded-md text-white focus:border-nexa-gold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-nexa-black border border-white/10 rounded-md text-white focus:border-nexa-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-nexa-black border border-white/10 rounded-md text-white focus:border-nexa-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Price Quoted ($)
                  </label>
                  <input
                    type="number"
                    value={formData.priceQuoted}
                    onChange={(e) => setFormData({ ...formData, priceQuoted: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-nexa-black border border-white/10 rounded-md text-white focus:border-nexa-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Amount Paid ($)
                  </label>
                  <input
                    type="number"
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-nexa-black border border-white/10 rounded-md text-white focus:border-nexa-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-nexa-black border border-white/10 rounded-md text-white focus:border-nexa-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Project URL
                  </label>
                  <input
                    type="url"
                    value={formData.projectUrl}
                    onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-nexa-black border border-white/10 rounded-md text-white focus:border-nexa-gold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">
                    Repository URL
                  </label>
                  <input
                    type="url"
                    value={formData.repoUrl}
                    onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-nexa-black border border-white/10 rounded-md text-white focus:border-nexa-gold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-nexa-gold text-nexa-black rounded-md font-medium hover:bg-nexa-goldHover transition-colors disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  {isSubmitting ? 'Creating...' : 'Create Client'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 bg-white/5 text-white border border-white/10 rounded-md font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
