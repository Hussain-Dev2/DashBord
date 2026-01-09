'use client'

import React, { useState } from 'react'
import { Plus, X, User, Building2, Phone, ImageIcon, DollarSign, Link as LinkIcon, Github } from 'lucide-react'
import { useClients } from '@/contexts/ClientsContext'
import { useLanguage } from '@/contexts/LanguageContext'

interface CreateClientData {
    name: string
    industry: string
    phone: string
    logoUrl: string
    projectUrl: string
    repoUrl: string
    priceQuoted: string
    amountPaid: string
}

export function CreateClientModal() {
  const { addClient } = useClients()
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateClientData>({
    name: '',
    industry: '',
    phone: '',
    logoUrl: '',
    projectUrl: '',
    repoUrl: '',
    priceQuoted: '',
    amountPaid: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await addClient({
        ...formData,
        priceQuoted: formData.priceQuoted ? parseFloat(formData.priceQuoted) : 0,
        amountPaid: formData.amountPaid ? parseFloat(formData.amountPaid) : 0,
      })
      
      setIsOpen(false)
      setFormData({
        name: '',
        industry: '',
        phone: '',
        logoUrl: '',
        projectUrl: '',
        repoUrl: '',
        priceQuoted: '',
        amountPaid: '',
      })
    } catch (error) {
      console.error('Failed to create client:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-nexa-gold to-nexa-goldHover text-nexa-black rounded-xl font-bold hover:shadow-lg hover:shadow-nexa-gold/20 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <Plus className="h-5 w-5" />
        <span className="hidden sm:inline">{t('add_client')}</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
            
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-32 bg-nexa-gold/5 blur-[100px] rounded-full pointer-events-none" />
            
            {/* Header */}
            <div className="flex justify-between items-start mb-8 relative z-10">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{t('add_client')}</h2>
                <p className="text-gray-400">Enter the details below to create a new client project.</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="group p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-400 group-hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-nexa-gold flex items-center gap-2">
                  <User className="h-4 w-4" /> {t('client_name')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">{t('client_name')} *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-500 group-focus-within:text-nexa-gold transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 glass-input"
                        placeholder="e.g. Acme Corp"
                        required
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">{t('industry')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-500 group-focus-within:text-nexa-gold transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 glass-input"
                        placeholder="e.g. Technology"
                      />
                    </div>
                  </div>
                  
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">{t('phone')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-500 group-focus-within:text-nexa-gold transition-colors" />
                      </div>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 glass-input"
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">Logo URL</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                        <ImageIcon className="h-5 w-5 text-gray-500 group-focus-within:text-nexa-gold transition-colors" />
                      </div>
                      <input
                        type="url"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 glass-input"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Financials */}
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-nexa-gold flex items-center gap-2">
                  <DollarSign className="h-4 w-4" /> {t('financials')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">{t('price_quoted')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                        <span className="text-gray-500 group-focus-within:text-nexa-gold font-bold transition-colors">$</span>
                      </div>
                      <input
                        type="number"
                        value={formData.priceQuoted}
                        onChange={(e) => setFormData({ ...formData, priceQuoted: e.target.value })}
                        className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-3 glass-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">{t('initial_payment')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                        <span className="text-gray-500 group-focus-within:text-nexa-gold font-bold transition-colors">$</span>
                      </div>
                      <input
                        type="number"
                        value={formData.amountPaid}
                        onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                        className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-3 glass-input [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 3: Links */}
              <div className="space-y-4">
                 <h3 className="text-lg font-semibold text-nexa-gold flex items-center gap-2">
                  <LinkIcon className="h-4 w-4" /> {t('project_url')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">{t('project_url')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                        <LinkIcon className="h-5 w-5 text-gray-500 group-focus-within:text-nexa-gold transition-colors" />
                      </div>
                      <input
                        type="url"
                        value={formData.projectUrl}
                        onChange={(e) => setFormData({ ...formData, projectUrl: e.target.value })}
                        className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 glass-input"
                        placeholder="https://client-site.com"
                      />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-400 mb-2 group-focus-within:text-white transition-colors">{t('repo_url')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 rtl:pr-4 rtl:left-auto rtl:right-0 flex items-center pointer-events-none">
                        <Github className="h-5 w-5 text-gray-500 group-focus-within:text-nexa-gold transition-colors" />
                      </div>
                      <input
                        type="url"
                        value={formData.repoUrl}
                        onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                        className="w-full pl-12 pr-4 rtl:pr-12 rtl:pl-4 py-3 glass-input"
                        placeholder="https://github.com/..."
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex gap-4 pt-6 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-nexa-gold to-nexa-goldHover text-nexa-black rounded-xl font-bold hover:shadow-lg hover:shadow-nexa-gold/20 transition-all duration-300 disabled:opacity-70 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Plus className="h-5 w-5" />
                  {isSubmitting ? t('creating') : t('create_client')}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-6 py-4 glass-button-secondary rounded-xl font-semibold"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
