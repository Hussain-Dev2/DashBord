'use client'

import React, { useState } from 'react'
import { FileText, Calendar, Send } from 'lucide-react'
import { useClients } from '@/contexts/ClientsContext'
import { formatDateTime } from '@/lib/format'
import { toast } from 'sonner'

interface Note {
  id: string
  content: string
  createdAt: string | Date
}

interface InteractionLogProps {
  clientId: string
  initialNotes: Note[]
}

export function InteractionLog({ clientId, initialNotes }: InteractionLogProps) {
  const { addNoteFn, clients } = useClients()
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sync with live context (works for demo mode live updates)
  const currentClient = clients.find(c => c.id === clientId)
  const notes = currentClient?.notes || initialNotes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      await addNoteFn(clientId, content)
      setContent('')
    } catch (error) {
      console.error('Failed to add note:', error)
      toast.error('Failed to add note')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-6 md:p-8 border border-white/10 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.25)' }}>
          <FileText className="h-5 w-5" style={{ color: 'var(--gold)' }} />
        </div>
        <h3 className="text-xl font-bold text-white">Interaction Log</h3>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-6 pr-1 max-h-[480px]">
        {notes && notes.length > 0 ? (
          notes.map((note: any) => (
            <div
              key={note.id}
              className="group p-4 rounded-xl border border-white/8 bg-white/[0.03] hover:border-[var(--gold)]/25 hover:bg-white/[0.06] transition-all duration-200"
            >
              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap mb-2">
                {note.content}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDateTime(note.createdAt)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FileText className="h-7 w-7 text-gray-600" />
            </div>
            <p className="text-gray-400 font-medium">No interactions yet</p>
            <p className="text-gray-600 text-sm mt-1">Add your first note below.</p>
          </div>
        )}
      </div>

      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a note about this client..."
          className="w-full rounded-xl p-4 pr-14 text-sm min-h-[110px] resize-none transition-all duration-200 text-white
            bg-white/5 border border-white/10 focus:border-[var(--gold)] focus:ring-2 focus:ring-[var(--gold)]/15 focus:outline-none"
          required
          disabled={isSubmitting}
        />
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="absolute bottom-4 right-4 p-2.5 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
          style={{ background: 'linear-gradient(135deg, var(--gold), var(--gold-hover))', color: 'var(--slate-950)' }}
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  )
}
