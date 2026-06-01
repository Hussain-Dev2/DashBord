import React, { useState, useRef } from 'react'
import { Plus, X, User, Building2, Phone, ImageIcon, DollarSign, Link as LinkIcon, Github, ChevronDown, ChevronUp, Settings2, Trash2, Globe, Hash, Upload } from 'lucide-react'
import { useClients } from '@/contexts/ClientsContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { useCurrency } from '@/contexts/CurrencyContext'

// Custom field types: text, url, number
interface CustomField {
  id: string
  type: 'text' | 'url' | 'number'
  label: string
  value: string
  isDefault?: boolean
}

interface FormData {
    name: string
    phone: string
    logoUrl: string
    priceQuoted: string
    amountPaid: string
    customFields: CustomField[]
}

interface FormErrors {
  name?: string
  priceQuoted?: string
  amountPaid?: string
}

export function CreateClientModal({ variant = 'default' }: { variant?: 'default' | 'mobile-nav' }) {
  const { addClient } = useClients()
  const { t, language } = useLanguage()
  const { currency, exchangeRate } = useCurrency()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    logoUrl: '',
    priceQuoted: '',
    amountPaid: '',
    customFields: [
      { id: 'industry', type: 'text', label: 'Industry', value: '', isDefault: true },
      { id: 'projectUrl', type: 'url', label: 'Project URL', value: '', isDefault: true },
      { id: 'repoUrl', type: 'url', label: 'Repo URL', value: '', isDefault: true },
    ]
  })

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters.'
    }
    const price = parseFloat(formData.priceQuoted)
    const paid = parseFloat(formData.amountPaid)
    if (formData.priceQuoted && (isNaN(price) || price < 0)) {
      newErrors.priceQuoted = 'Must be a positive number.'
    }
    if (formData.amountPaid && (isNaN(paid) || paid < 0)) {
      newErrors.amountPaid = 'Must be a positive number.'
    }
    if (!isNaN(price) && !isNaN(paid) && paid > price && price > 0) {
      newErrors.amountPaid = 'Amount paid cannot exceed total price.'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle local image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        alert('Image too large. Please choose a file smaller than 2MB.')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setIsSubmitting(true)
    
    try {
      let priceQuoted = formData.priceQuoted ? parseFloat(formData.priceQuoted) : 0
      let amountPaid = formData.amountPaid ? parseFloat(formData.amountPaid) : 0

      if (currency === 'IQD') {
        priceQuoted = priceQuoted / exchangeRate
        amountPaid = amountPaid / exchangeRate
      }

      const industry = formData.customFields.find(f => f.id === 'industry')?.value || ''
      const projectUrl = formData.customFields.find(f => f.id === 'projectUrl')?.value || ''
      const repoUrl = formData.customFields.find(f => f.id === 'repoUrl')?.value || ''

      await addClient({
        name: formData.name,
        phone: formData.phone,
        logoUrl: formData.logoUrl,
        industry,
        projectUrl,
        repoUrl,
        priceQuoted,
        amountPaid,
      })
      
      setIsOpen(false)
      setErrors({})
      setFormData({
        name: '',
        phone: '',
        logoUrl: '',
        priceQuoted: '',
        amountPaid: '',
        customFields: [
          { id: 'industry', type: 'text', label: 'Industry', value: '', isDefault: true },
          { id: 'projectUrl', type: 'url', label: 'Project URL', value: '', isDefault: true },
          { id: 'repoUrl', type: 'url', label: 'Repo URL', value: '', isDefault: true },
        ]
      })
      setShowAdvanced(false)
    } catch (error) {
      console.error('Failed to create client:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addCustomField = () => {
    const newField: CustomField = {
      id: `custom-${Date.now()}`,
      type: 'text',
      label: 'New Field',
      value: ''
    }
    setFormData(prev => ({
      ...prev,
      customFields: [...prev.customFields, newField]
    }))
  }

  const removeCustomField = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter(f => f.id !== id)
    }))
  }

  const updateCustomField = (id: string, updates: Partial<CustomField>) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.map(f => f.id === id ? { ...f, ...updates } : f)
    }))
  }

  const initials = formData.name ? formData.name.substring(0, 2).toUpperCase() : '??'

  return (
    <>
      {variant === 'mobile-nav' ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all duration-300 active:scale-90 hover:scale-110"
          style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-hover))', color: 'var(--slate-950)' }}
        >
          <Plus className="h-8 w-8" strokeWidth={2.5} />
        </button>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-5 py-3 rounded-2xl font-black transition-all duration-300 hover:scale-[1.05] active:scale-95 shadow-xl hover:shadow-gold-500/20"
          style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-hover))', color: 'var(--slate-950)' }}
        >
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" strokeWidth={3} />
          <span className="hidden md:inline uppercase tracking-tighter">{t('add_client')}</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-6 z-[60]">
          <div className="bg-slate-900 border border-white/10 rounded-t-[2.5rem] md:rounded-[2rem] p-8 md:p-12 max-w-xl w-full max-h-[95vh] overflow-y-auto relative animate-in fade-in slide-in-from-bottom-10 duration-500 scrollbar-hide">
            
            <div className="flex justify-between items-center mb-10">
              <div className="space-y-1">
                <h2 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">{t('add_client')}</h2>
                <div className="h-1 w-12 bg-nexa-gold rounded-full" />
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-12 h-12 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl transition-all group"
                type="button"
              >
                <X className="h-6 w-6 text-gray-500 group-hover:text-white group-hover:rotate-90 transition-all" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Premium Avatar Editor - Now with true file upload */}
              <div className="flex flex-col items-center gap-5 mb-4 group">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div 
                  className="relative cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="h-28 w-28 rounded-[2.5rem] border-2 border-dashed border-white/10 group-hover:border-nexa-gold/40 flex items-center justify-center overflow-hidden transition-all duration-500 bg-white/[0.02] shadow-2xl group-hover:shadow-gold-500/10">
                    {formData.logoUrl ? (
                      <img src={formData.logoUrl} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-gray-700 group-hover:text-nexa-gold transition-colors italic uppercase">{initials}</span>
                    )}
                    
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 backdrop-blur-sm">
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="h-6 w-6 text-white scale-75 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] text-white font-black uppercase tracking-widest">Select</span>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-nexa-gold w-10 h-10 rounded-2xl flex items-center justify-center text-slate-950 shadow-xl border-4 border-slate-900">
                    <Plus className="h-5 w-5" strokeWidth={3} />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Company Identity</span>
                  <p className="text-xs text-white/40 font-medium">{formData.logoUrl ? 'Logo selected' : 'Press to choose from device'}</p>
                </div>
              </div>

              {/* Core Attributes */}
              <div className="space-y-5">
                <div className="relative group">
                  <User className="absolute start-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-nexa-gold transition-all duration-300" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full min-h-[64px] ps-14 pe-6 bg-white/[0.03] border rounded-2xl text-white font-bold text-lg outline-none transition-all placeholder:text-gray-700 ${
                      errors.name ? 'border-red-500/50 focus:border-red-500/70' : 'border-white/5 focus:border-nexa-gold/30'
                    }`}
                    placeholder={t('client_name')}
                    required
                  />
                  {errors.name && (
                    <p className="absolute -bottom-5 start-0 text-xs text-red-400 font-medium">{errors.name}</p>
                  )}
                </div>

                <div className="relative group">
                  <Phone className="absolute start-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-600 group-focus-within:text-nexa-gold transition-all duration-300" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full min-h-[64px] ps-14 pe-6 bg-white/[0.03] border border-white/5 focus:border-nexa-gold/30 rounded-2xl text-white font-bold text-lg outline-none transition-all placeholder:text-gray-700"
                    placeholder={t('phone')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="relative group">
                    <span className="absolute start-5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-600 group-focus-within:text-nexa-gold transition-all">
                      {currency === 'USD' ? '$' : 'IQ'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={formData.priceQuoted}
                      onChange={(e) => setFormData({ ...formData, priceQuoted: e.target.value })}
                      className={`w-full min-h-[64px] ps-14 pe-6 bg-white/[0.03] border rounded-2xl text-white font-bold text-base outline-none transition-all placeholder:text-gray-700 ${
                        errors.priceQuoted ? 'border-red-500/50' : 'border-white/5 focus:border-nexa-gold/30'
                      }`}
                      placeholder={t('price_quoted')}
                    />
                    {errors.priceQuoted && (
                      <p className="mt-1 text-xs text-red-400 font-medium ps-2">{errors.priceQuoted}</p>
                    )}
                  </div>
                  <div className="relative group">
                    <span className="absolute start-5 top-1/2 -translate-y-1/2 text-sm font-black text-gray-600 group-focus-within:text-nexa-gold transition-all">
                      {currency === 'USD' ? '$' : 'IQ'}
                    </span>
                    <input
                      type="number"
                      min="0"
                      value={formData.amountPaid}
                      onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                      className={`w-full min-h-[64px] ps-14 pe-6 bg-white/[0.03] border rounded-2xl text-white font-bold text-base outline-none transition-all placeholder:text-gray-700 ${
                        errors.amountPaid ? 'border-red-500/50' : 'border-white/5 focus:border-nexa-gold/30'
                      }`}
                      placeholder={t('initial_payment')}
                    />
                    {errors.amountPaid && (
                      <p className="mt-1 text-xs text-red-400 font-medium ps-2">{errors.amountPaid}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Advanced Controls */}
              <div className="pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full flex items-center justify-between p-5 bg-white/[0.02] border border-white/5 rounded-2xl group active:bg-white/[0.04] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-nexa-gold/10 flex items-center justify-center text-nexa-gold transition-colors">
                      <Settings2 className="h-5 w-5" />
                    </div>
                    <div className="text-start">
                      <span className="block text-xs font-black text-gray-500 uppercase tracking-widest">Advanced Setup</span>
                      <span className="block text-sm text-white font-bold">{showAdvanced ? 'Collapse options' : 'Customize more fields'}</span>
                    </div>
                  </div>
                  {showAdvanced ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
                </button>

                {showAdvanced && (
                  <div className="mt-6 space-y-6 animate-in slide-in-from-top-4 duration-300">
                    <div className="space-y-4">
                      {formData.customFields.map((field) => (
                        <div key={field.id} className="group">
                          {field.isDefault ? (
                            <div className="relative">
                              <div className="absolute start-5 top-1/2 -translate-y-1/2 pointer-events-none">
                                {field.id === 'industry' ? <Building2 className="h-4 w-4 text-gray-600 group-focus-within:text-nexa-gold" /> : 
                                 field.type === 'url' ? <Globe className="h-4 w-4 text-gray-600 group-focus-within:text-nexa-gold" /> : 
                                 <Settings2 className="h-4 w-4 text-gray-600" />}
                              </div>
                              <input
                                type={field.type}
                                value={field.value}
                                onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                                className="w-full min-h-[56px] ps-12 pe-6 bg-black/20 border border-white/5 focus:border-white/10 rounded-2xl text-white font-medium text-sm outline-none transition-all placeholder:text-gray-700"
                                placeholder={field.label}
                              />
                            </div>
                          ) : (
                            <div className="relative p-6 rounded-[2rem] bg-slate-950/40 border border-white/5 space-y-5 shadow-inner">
                              <div className="flex flex-col gap-4">
                                {/* Type Selector - Premium Segmented Control */}
                                <div className="flex items-center justify-between">
                                  <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                                    {(['text', 'url', 'number'] as const).map((t) => (
                                      <button
                                        key={t}
                                        type="button"
                                        onClick={() => updateCustomField(field.id, { type: t })}
                                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                                          field.type === t 
                                            ? 'bg-nexa-gold text-slate-950 shadow-lg' 
                                            : 'text-gray-600 hover:text-gray-300'
                                        }`}
                                      >
                                        {t}
                                      </button>
                                    ))}
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => removeCustomField(field.id)}
                                    className="w-8 h-8 flex items-center justify-center text-red-900/40 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                
                                <div className="space-y-3">
                                  <input
                                    type="text"
                                    value={field.label}
                                    onChange={(e) => updateCustomField(field.id, { label: e.target.value })}
                                    className="w-full bg-transparent border-none text-base font-black text-white p-0 outline-none placeholder:text-gray-800 italic"
                                    placeholder="FIELD NAME"
                                  />
                                  <div className="relative group/input">
                                    <div className="absolute start-4 top-1/2 -translate-y-1/2">
                                       {field.type === 'number' ? <Hash className="h-4 w-4 text-gray-700" /> : 
                                        field.type === 'url' ? <LinkIcon className="h-4 w-4 text-gray-700" /> : 
                                        <Plus className="h-4 w-4 text-gray-700" />}
                                    </div>
                                    <input
                                      type={field.type}
                                      value={field.value}
                                      onChange={(e) => updateCustomField(field.id, { value: e.target.value })}
                                      className="w-full h-12 ps-12 pe-4 bg-white/[0.02] border border-white/5 rounded-xl text-sm focus:border-nexa-gold/20 outline-none transition-all"
                                      placeholder={`Enter ${field.label.toLowerCase()}...`}
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addCustomField}
                      className="w-full py-5 border-2 border-dashed border-white/5 rounded-[2rem] text-xs font-black text-gray-600 hover:border-nexa-gold/30 hover:text-nexa-gold hover:bg-nexa-gold/5 transition-all uppercase tracking-widest active:scale-[0.98]"
                    >
                      + Append New Property
                    </button>
                  </div>
                )}
              </div>

              {/* Primary Interactions */}
              <div className="flex flex-col md:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] min-h-[64px] rounded-2xl font-black uppercase tracking-widest shadow-2xl shadow-gold-500/10 active:scale-95 transition-all flex items-center justify-center gap-3"
                  style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-hover))', color: 'var(--slate-950)' }}
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-slate-950/20 border-t-slate-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      <Plus className="h-5 w-5" strokeWidth={3} />
                      {t('create_client')}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 min-h-[64px] border border-white/5 rounded-2xl text-gray-500 font-black uppercase tracking-widest hover:text-white hover:bg-white/5 transition-all text-sm active:scale-95"
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
