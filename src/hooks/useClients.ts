import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { SerializedClient, CreateClientData, UpdateClientData, Status } from '@/lib/types'
import { useEffect } from 'react'

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

export function useClients() {
  const queryClient = useQueryClient()

  // ── Query: read all clients via API (Admin only path for data) ──
  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const data = await apiCall('/api/clients', 'GET')

      return (data || []).map((client: any) => ({
        ...client,
        priceQuoted: Number(client.priceQuoted),
        amountPaid: Number(client.amountPaid),
        notes: client.Note || client.notes || [],
        payments: client.Payment || client.payments || [],
        lastPayment: (client.Payment || client.payments)?.[0]?.date || null,
      })) as SerializedClient[]
    }
  })

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
    mutationFn: (data: CreateClientData) => apiCall('/api/clients', 'POST', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  const updateClient = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateClientData }) =>
      apiCall(`/api/clients/${id}`, 'PATCH', data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  const deleteClient = useMutation({
    mutationFn: (id: string) => apiCall(`/api/clients/${id}`, 'DELETE'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      apiCall(`/api/clients/${id}`, 'PATCH', { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  const addNote = useMutation({
    mutationFn: ({ clientId, content }: { clientId: string; content: string }) =>
      apiCall(`/api/clients/${clientId}/note`, 'POST', { content }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  const addPayment = useMutation({
    mutationFn: ({ clientId, amount }: { clientId: string; amount: number }) =>
      apiCall(`/api/clients/${clientId}/payment`, 'POST', { amount }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] }),
  })

  const addDebt = useMutation({
    mutationFn: ({ clientId, amount }: { clientId: string; amount: number }) =>
      apiCall(`/api/clients/${clientId}/debt`, 'POST', { amount }),
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
