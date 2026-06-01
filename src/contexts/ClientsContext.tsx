'use client'
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useClients as useSupabaseClients } from '@/hooks/useClients'
import { SerializedClient, SerializedPayment, Status, CreateClientData, UpdateClientData } from '@/lib/types'
import { SAMPLE_CLIENTS } from '@/lib/constants'

// Re-export types
export type ClientWithNotes = SerializedClient

// Interface
interface ClientsContextType {
  clients: ClientWithNotes[]
  addClient: (data: CreateClientData) => Promise<void>
  updateClientFn: (id: string, data: UpdateClientData) => Promise<void>
  deleteClientFn: (id: string) => Promise<void>
  updateStatusFn: (id: string, status: Status) => Promise<void>
  addPaymentFn: (clientId: string, amount: number) => Promise<void>
  addDebtFn: (clientId: string, amount: number) => Promise<void>
  addNoteFn: (clientId: string, content: string) => Promise<void>
  resetDemoData: () => void
  isLoading: boolean
}

const ClientsContext = createContext<ClientsContextType | undefined>(undefined)

export function ClientsProvider({ 
  children, 
  initialClients = []
}: { 
  children: React.ReactNode
  initialClients?: ClientWithNotes[] 
}) {
  const { data: session } = useSession()
  const isAdmin = session?.user?.isAdmin ?? false
  const router = useRouter()

  // 1. Supabase (Admin) Data
  const { 
      clients: serverClients, 
      isLoading: isServerLoading,
      addClient: addClientCtx,
      updateClient: updateClientCtx,
      deleteClient: deleteClientCtx,
      updateStatus: updateStatusCtx,
      addPayment: addPaymentCtx,
      addDebt: addDebtCtx,
      addNote: addNoteCtx
  } = useSupabaseClients({ enabled: isAdmin })

  // 2. Demo (Local) Data
  const [demoClients, setDemoClients] = useState<ClientWithNotes[]>([])

  // Initialize Demo Data
  useEffect(() => {
    if (!isAdmin) {
      const stored = localStorage.getItem('demo_clients')
      if (stored) {
        try {
          setDemoClients(JSON.parse(stored))
        } catch (e) {
          console.error("Failed to parse demo clients", e)
          setDemoClients(SAMPLE_CLIENTS as any)
        }
      } else {
        setDemoClients(SAMPLE_CLIENTS as any)
      }
    }
  }, [isAdmin])

  // Persist Demo Data
  useEffect(() => {
    if (!isAdmin && demoClients.length > 0) {
      localStorage.setItem('demo_clients', JSON.stringify(demoClients))
    }
  }, [demoClients, isAdmin])

  // Derived State
  // Note: if isAdmin is true, we use serverClients. If false, demoClients.
  const clients = isAdmin ? serverClients : demoClients
  const isLoading = isAdmin ? isServerLoading : false

  // Handlers
  const addClient = useCallback(async (data: CreateClientData) => {
    console.log('[addClient] isAdmin:', isAdmin, 'data:', data)
    if (isAdmin) {
      try {
        await addClientCtx.mutateAsync(data)
        toast.success('Client created')
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        console.error('[addClient] FAILED:', msg)
        toast.error(`Failed to create client: ${msg}`)
      }
    } else {
      const newClient: ClientWithNotes = {
        id: `demo-${Date.now()}`,
        name: data.name,
        phone: data.phone ?? null,
        industry: data.industry ?? null,
        logoUrl: data.logoUrl ?? null,
        projectUrl: data.projectUrl ?? null,
        repoUrl: data.repoUrl ?? null,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: [],
        payments: [],
        priceQuoted: Number(data.priceQuoted) || 0,
        amountPaid: Number(data.amountPaid) || 0,
        lastPayment: null,
      }
      setDemoClients(prev => [newClient, ...prev])
      toast.success('Demo: Client created (Local Only)')
    }
  }, [isAdmin, addClientCtx])

  const updateClientFn = useCallback(async (id: string, data: UpdateClientData) => {
    if (isAdmin) {
      try {
        await updateClientCtx.mutateAsync({id, data})
        toast.success('Client updated')
      } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        console.error('[updateClient] FAILED:', msg)
        toast.error(`Failed to update client: ${msg}`)
      }
    } else {
        setDemoClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
        toast.success('Demo: Client updated')
    }
  }, [isAdmin, updateClientCtx])

  const deleteClientFn = useCallback(async (id: string) => {
    if (isAdmin) {
        try {
            await deleteClientCtx.mutateAsync(id)
            toast.success('Client deleted')
        } catch (error) {
            toast.error('Failed to delete client')
        }
    } else {
        setDemoClients(prev => prev.filter(c => c.id !== id))
        toast.success('Demo: Client deleted')
    }
  }, [isAdmin, deleteClientCtx])

  const updateStatusFn = useCallback(async (id: string, status: Status) => {
      if (isAdmin) {
          try {
              await updateStatusCtx.mutateAsync({id, status})
              toast.success('Status updated')
          } catch (error) {
              toast.error('Failed to update status')
          }
      } else {
          setDemoClients(prev => prev.map(c => c.id === id ? { ...c, status } : c))
          toast.success('Demo: Status updated')
      }
  }, [isAdmin, updateStatusCtx])

   const addPaymentFn = useCallback(async (clientId: string, amount: number) => {
      if (isAdmin) {
          try {
              await addPaymentCtx.mutateAsync({clientId, amount})
              toast.success('Payment added')
          } catch (error: any) {
              console.error('[addPayment] FAILED:', error?.message || error)
              toast.error(`Failed to add payment: ${error?.message || 'Unknown error'}`)
          }
      } else {
          // Demo mode: update amountPaid AND push to payments[] history
          setDemoClients(prev => prev.map(c => {
            if (c.id === clientId) {
              const newPayment: SerializedPayment = {
                id: `demo-pay-${Date.now()}`,
                amount,
                date: new Date().toISOString(),
                clientId,
                type: 'PAYMENT',
              }
              return {
                ...c,
                amountPaid: Number(c.amountPaid) + amount,
                updatedAt: new Date().toISOString(),
                payments: [newPayment, ...(c.payments || [])]
              }
            }
            return c
          }))
          toast.success('✅ Payment recorded — debt reduced!')
      }
   }, [isAdmin, addPaymentCtx])
  
   const addDebtFn = useCallback(async (clientId: string, amount: number) => {
      if (isAdmin) {
          try {
              await addDebtCtx.mutateAsync({clientId, amount})
              toast.success('Debt recorded')
          } catch (error: any) {
              console.error('[addDebt] FAILED:', error?.message || error)
              toast.error(`Failed to record debt: ${error?.message || 'Unknown error'}`)
          }
      } else {
          // Demo mode: update priceQuoted AND push to payments[] history as negative
          setDemoClients(prev => prev.map(c => {
            if (c.id === clientId) {
              const newDebt: SerializedPayment = {
                id: `demo-debt-${Date.now()}`,
                amount: -amount, // stored as negative for history
                date: new Date().toISOString(),
                clientId,
                type: 'DEBT',
              }
              return {
                ...c,
                priceQuoted: Number(c.priceQuoted) + amount,
                updatedAt: new Date().toISOString(),
                payments: [newDebt, ...(c.payments || [])]
              }
            }
            return c
          }))
          toast.success('⚠️ Debt recorded — total balance increased!')
      }
   }, [isAdmin, addDebtCtx])

   const addNoteFn = useCallback(async (clientId: string, content: string) => {
       if (isAdmin) {
           try {
               await addNoteCtx.mutateAsync({clientId, content})
               toast.success('Note added')
           } catch (error) {
               toast.error('Failed to add note')
           }
       } else {
           setDemoClients(prev => prev.map(c => {
             if (c.id === clientId) {
               return {
                 ...c,
                 notes: [
                   { id: `demo-note-${Date.now()}`, content, createdAt: new Date().toISOString(), clientId },
                   ...(c.notes || [])
                 ]
               }
             }
             return c
           }))
           toast.success('Demo: Note added')
       }
   }, [isAdmin, addNoteCtx])

  const resetDemoData = useCallback(() => {
    if (isAdmin) return
    localStorage.removeItem('demo_clients')
    setDemoClients([]) 
    toast.info('Demo data cleared')
  }, [isAdmin])

  const value = useMemo(() => ({
    clients, 
    addClient, 
    updateClientFn, 
    deleteClientFn, 
    updateStatusFn,
    addPaymentFn,
    addDebtFn,
    addNoteFn,
    resetDemoData,
    isLoading 
  }), [clients, addClient, updateClientFn, deleteClientFn, updateStatusFn, addPaymentFn, addDebtFn, addNoteFn, resetDemoData, isLoading])

  return (
    <ClientsContext.Provider value={value}>
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
