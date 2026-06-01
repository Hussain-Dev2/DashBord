import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Subscription, CreateSubscriptionData, SubscriptionStatus } from '@/lib/types'

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `API error ${res.status}`)
  return json as T
}

// ── List subscriptions (optionally scoped to a client) ────

export function useSubscriptions(clientId?: string) {
  const url = clientId
    ? `/api/subscriptions?client_id=${clientId}`
    : '/api/subscriptions'

  return useQuery<Subscription[]>({
    queryKey: ['subscriptions', clientId],
    queryFn: () => apiFetch(url),
  })
}

// ── Create subscription ───────────────────────────────────

export function useCreateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateSubscriptionData) =>
      apiFetch<Subscription>('/api/subscriptions', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] })
      queryClient.invalidateQueries({ queryKey: ['subscriptions', variables.client_id] })
      queryClient.invalidateQueries({ queryKey: ['journal_entries'] })
      queryClient.invalidateQueries({ queryKey: ['report_pl'] })
    },
  })
}

// ── Update subscription status ────────────────────────────

export function useUpdateSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: SubscriptionStatus }) =>
      apiFetch<Subscription>(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  })
}

// ── Cancel subscription ───────────────────────────────────

export function useCancelSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<Subscription>(`/api/subscriptions/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'canceled' }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  })
}

// ── Delete subscription ───────────────────────────────────

export function useDeleteSubscription() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/subscriptions/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['subscriptions'] }),
  })
}
