import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { SerializedClient, CreateClientData, UpdateClientData, Status } from '@/lib/types'
import { useEffect } from 'react'
import { db } from '@/lib/db'
import { toast } from 'sonner'

// ── Helpers ──────────────────────────────────────────────
async function apiCall(path: string, method: string, body?: object) {
  console.log(`[apiCall] ${method} ${path}`, body)
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })

  const contentType = res.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    const json = await res.json()
    if (!res.ok) {
      console.error(`[apiCall] Error ${res.status}:`, json)
      throw new Error(json.error || `API error ${res.status}`)
    }
    return json
  } else {
    const text = await res.text()
    console.error(`[apiCall] Error ${res.status} (non-JSON):`, text.slice(0, 200))
    throw new Error(`Server returned ${res.status}: ${text.slice(0, 50)}...`)
  }
}

export function useClients(options: { enabled?: boolean } = {}) {
  const queryClient = useQueryClient()
  const enabled = options.enabled !== false

  // ── Query: read all clients with Offline Fallback ──
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        const data = await apiCall('/api/clients', 'GET')
        const formatted = (data || []).map((client: any) => ({
          ...client,
          priceQuoted: Number(client.priceQuoted),
          amountPaid: Number(client.amountPaid),
          notes: client.Note || client.notes || [],
          payments: client.Payment || client.payments || [],
          lastPayment: (client.Payment || client.payments)?.[0]?.date || null,
        })) as SerializedClient[]

        // Store in local DB for offline use
        await db.clients.clear()
        await db.clients.bulkPut(formatted)
        return formatted
      } catch (err) {
        console.warn('[apiCall] API failed, falling back to local DB:', err)
        const localData = await db.clients.toArray()
        if (localData.length > 0) return localData
        throw err // Re-throw if nothing locally either
      }
    },
    enabled: enabled
  })

  // ── Helper to Queue Offline Mutations ──
  const queueSync = async (type: any, clientId: string, data: any) => {
    if (!navigator.onLine) {
      await db.syncQueue.add({
        type,
        clientId,
        data,
        timestamp: new Date().toISOString()
      })
      toast.info('Changes saved locally (Offline). Will sync when back online.')
      return true
    }
    return false
  }

  // ── Realtime subscription ──
  useEffect(() => {
    const channel = supabase
      .channel('realtime-clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Client' }, () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Note' }, () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Payment' }, () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] })
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [queryClient])

  // ── Mutations: all go through API routes (service role key, bypasses RLS) ──

  const addClient = useMutation({
    mutationFn: async (data: CreateClientData) => {
      try {
        return await apiCall('/api/clients', 'POST', data)
      } catch (err) {
        if (!navigator.onLine) {
          await queueSync('ADD_CLIENT', 'new', data)
          return data // Mock return for optimistic update
        }
        throw err
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  const updateClient = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateClientData }) => {
      try {
        return await apiCall(`/api/clients/${id}`, 'PATCH', data)
      } catch (err) {
        if (!navigator.onLine) {
          await queueSync('UPDATE_CLIENT', id, data)
          return data
        }
        throw err
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
      try {
        return await apiCall(`/api/clients/${id}`, 'DELETE')
      } catch (err) {
        if (!navigator.onLine) {
          await queueSync('DELETE_CLIENT', id, {})
          return id
        }
        throw err
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      try {
        return await apiCall(`/api/clients/${id}`, 'PATCH', { status })
      } catch (err) {
        if (!navigator.onLine) {
          await queueSync('UPDATE_STATUS', id, { status })
          return { status }
        }
        throw err
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  const addNote = useMutation({
    mutationFn: async ({ clientId, content }: { clientId: string; content: string }) => {
      try {
        return await apiCall(`/api/clients/${clientId}/note`, 'POST', { content })
      } catch (err) {
        if (!navigator.onLine) {
          await queueSync('ADD_NOTE', clientId, { content })
          return { content }
        }
        throw err
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  const addPayment = useMutation({
    mutationFn: async ({ clientId, amount }: { clientId: string; amount: number }) => {
      try {
        return await apiCall(`/api/clients/${clientId}/payment`, 'POST', { amount })
      } catch (err) {
        if (!navigator.onLine) {
          await queueSync('ADD_PAYMENT', clientId, { amount })
          return { amount }
        }
        throw err
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  const addDebt = useMutation({
    mutationFn: async ({ clientId, amount }: { clientId: string; amount: number }) => {
      try {
        return await apiCall(`/api/clients/${clientId}/debt`, 'POST', { amount })
      } catch (err) {
        if (!navigator.onLine) {
          await queueSync('ADD_DEBT', clientId, { amount })
          return { amount }
        }
        throw err
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  return {
    clients,
    isLoading,
    error,
    addClient,
    updateClient,
    deleteClient,
    updateStatus,
    addNote,
    addPayment,
    addDebt,
  }
}
