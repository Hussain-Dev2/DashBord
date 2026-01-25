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

  // Sync with context if in demo mode, otherwise use initialNotes (passed from server for admin)
  // Actually, context 'clients' will have the updated notes if we use context.
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
    <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8 shadow-2xl h-full flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-nexa-gold/20 flex items-center justify-center">
          <FileText className="h-5 w-5 text-nexa-gold" />
        </div>
        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
          Interaction Log
        </h3>
      </div>
      
      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 max-h-[500px] custom-scrollbar">
        {notes && notes.length > 0 ? (
          notes.map((note: any) => (
            <div 
              key={note.id} 
              className="group p-5 bg-gradient-to-br from-white/5 to-transparent hover:from-white/10 border border-white/10 hover:border-nexa-gold/30 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-nexa-gold/10"
            >
              <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap mb-3">
                {note.content}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3" />
                <span>{formatDateTime(note.createdAt)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
            <p className="text-gray-500 text-lg">No interactions recorded yet.</p>
            <p className="text-gray-600 text-sm mt-2">Add your first note below to start tracking.</p>
          </div>
        )}
      </div>
      
      {/* Add Note Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <textarea 
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a new note about this client..." 
            className="w-full bg-nexa-black/50 border border-white/20 rounded-xl p-4 pr-14 text-sm focus:border-nexa-gold focus:outline-none focus:ring-2 focus:ring-nexa-gold/20 min-h-[120px] resize-none transition-all duration-300"
            required
            disabled={isSubmitting}
          />
          <button 
            type="submit" 
            disabled={isSubmitting || !content.trim()}
            className="absolute bottom-4 right-4 p-3 bg-gradient-to-r from-nexa-gold to-nexa-goldHover text-nexa-black rounded-lg hover:shadow-lg hover:shadow-nexa-gold/50 transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  )
}
