import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Product, CreateProductData } from '@/lib/types'

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `API error ${res.status}`)
  return json as T
}

// ── List all products ─────────────────────────────────────

export function useProducts() {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => apiFetch('/api/products'),
    staleTime: 2 * 60 * 1000,
  })
}

// ── Create a product ──────────────────────────────────────

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateProductData) =>
      apiFetch<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

// ── Delete a product ──────────────────────────────────────

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}
