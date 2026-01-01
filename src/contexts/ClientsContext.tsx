'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner' 
import { createClient, updateClient, deleteClient as deleteClientAction, updateClientStatus } from '@/app/actions'
import { Client, Status } from '@prisma/client'

// Define the shape of our Client type for the frontend (handling Decimals as numbers if needed)
export type ClientWithNotes = Omit<Client, 'priceQuoted' | 'amountPaid'> & {
  priceQuoted: number
  amountPaid: number
  notes?: any[]
}

interface ClientsContextType {
  clients: ClientWithNotes[]
  addClient: (data: any) => Promise<void>
  updateClientFn: (id: string, data: any) => Promise<void>
  deleteClientFn: (id: string) => Promise<void>
  updateStatusFn: (id: string, status: Status) => Promise<void>
  resetDemoData: () => void
  isLoading: boolean
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined)

export function ClientsProvider({ 
  children, 
  initialClients 
}: { 
  children: React.ReactNode
  initialClients: ClientWithNotes[] 
}) {
  const { data: session } = useSession()
  const router = useRouter()
  const [clients, setClients] = useState<ClientWithNotes[]>(initialClients)
  const [isLoading, setIsLoading] = useState(false)

  const isAdmin = session?.user?.isAdmin

  // Initialize from LocalStorage for Demo Users
  useEffect(() => {
    if (session?.user && !isAdmin) {
      const stored = localStorage.getItem('demo_clients')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // Simple date reconstruction if needed, or rely on strings
          setClients(parsed)
        } catch (e) {
          console.error("Failed to parse demo clients", e)
        }
      } else {
        // If no stored data, use the initialClients (which are the Sample Clients)
        setClients(initialClients)
      }
    } else {
      // Admin: Always sync with initialClients (server state)
      setClients(initialClients)
    }
  }, [session, isAdmin, initialClients])

  // Persist to LocalStorage whenever clients change (for Demo users)
  useEffect(() => {
    if (session?.user && !isAdmin && clients.length > 0) {
      localStorage.setItem('demo_clients', JSON.stringify(clients))
    }
  }, [clients, session, isAdmin])

  const addClient = async (data: any) => {
    setIsLoading(true)
    if (isAdmin) {
      try {
        await createClient(data)
        router.refresh()
        toast.success('Client created successfully')
      } catch (error) {
        toast.error('Failed to create client')
      }
    } else {
      // Demo Mode
      const newClient: ClientWithNotes = {
        ...data,
        id: `demo-${Date.now()}`,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: [],
        priceQuoted: data.priceQuoted || 0,
        amountPaid: data.amountPaid || 0,
      }
      setClients(prev => [newClient, ...prev])
      toast.success('Demo: Client created (Local Only)')
    }
    setIsLoading(false)
  }

  const updateClientFn = async (id: string, data: any) => {
    setIsLoading(true)
    if (isAdmin) {
      try {
        await updateClient(id, data)
        router.refresh()
        toast.success('Client updated')
      } catch (error) {
        toast.error('Failed to update client')
      }
    } else {
      // Demo Mode
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
      toast.success('Demo: Client updated (Local Only)')
    }
    setIsLoading(false)
  }

  const updateStatusFn = async (id: string, status: Status) => {
    if (isAdmin) {
      try {
        await updateClientStatus(id, status)
        router.refresh()
        toast.success('Status updated')
      } catch (error) {
        toast.error('Failed to update status')
      }
    } else {
       // Demo Mode
       setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c))
       toast.success('Demo: Status updated (Local Only)')
    }
  }

  const deleteClientFn = async (id: string) => {
    setIsLoading(true)
    if (isAdmin) {
      try {
        await deleteClientAction(id)
        router.refresh()
        toast.success('Client deleted')
      } catch (error) {
        toast.error('Failed to delete client')
      }
    } else {
      // Demo Mode
      setClients(prev => prev.filter(c => c.id !== id))
      toast.success('Demo: Client deleted (Local Only)')
    }
    setIsLoading(false)
  }

  const resetDemoData = () => {
    if (isAdmin) return
    localStorage.removeItem('demo_clients')
    // User requested reset to clear EVERYTHING (0 earnings)
    setClients([]) 
    toast.info('Demo data cleared')
  }

  return (
    <ClientsContext.Provider value={{ 
      clients, 
      addClient, 
      updateClientFn, 
      deleteClientFn, 
      updateStatusFn,
      resetDemoData,
      isLoading 
    }}>
      {children}
    </ClientsContext.Provider>
  )
}

export function useClients() {
  const context = useContext(ClientsContext)
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientsProvider')
  }
  return context
}
