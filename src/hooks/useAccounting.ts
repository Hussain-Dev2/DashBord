import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  Account,
  JournalEntry,
  Expense,
  CreateExpenseData,
  PLStatement,
  BalanceSheet,
} from '@/lib/types'

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.error || `API error ${res.status}`)
  return json as T
}

// ── Chart of Accounts ─────────────────────────────────────

export function useChartOfAccounts() {
  return useQuery<Account[]>({
    queryKey: ['coa'],
    queryFn: () => apiFetch('/api/accounting/coa'),
    staleTime: 5 * 60 * 1000, // rarely changes
  })
}

// ── Journal Entries ───────────────────────────────────────

export function useJournalEntries(filters?: { from?: string; to?: string; reference_id?: string }) {
  const params = new URLSearchParams()
  if (filters?.from)         params.set('from', filters.from)
  if (filters?.to)           params.set('to', filters.to)
  if (filters?.reference_id) params.set('reference_id', filters.reference_id)

  return useQuery<JournalEntry[]>({
    queryKey: ['journal_entries', filters],
    queryFn: () => apiFetch(`/api/accounting/journal?${params.toString()}`),
  })
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      description: string
      date?: string
      reference_id?: string
      reference_type?: string
      items: { account_id: string; debit?: number; credit?: number }[]
    }) => apiFetch('/api/accounting/journal', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['journal_entries'] }),
  })
}

// ── Financial Reports ─────────────────────────────────────

export function usePLStatement(from: string, to: string) {
  return useQuery<PLStatement>({
    queryKey: ['report_pl', from, to],
    queryFn: () => apiFetch(`/api/accounting/reports?type=pl&from=${from}&to=${to}`),
    enabled: !!(from && to),
  })
}

export function useBalanceSheet(asOf?: string) {
  const asOfParam = asOf || new Date().toISOString()
  return useQuery<BalanceSheet>({
    queryKey: ['report_balance', asOfParam],
    queryFn: () => apiFetch(`/api/accounting/reports?type=balance&asOf=${asOfParam}`),
  })
}

// ── Expenses ──────────────────────────────────────────────

export function useExpenses(filters?: { from?: string; to?: string }) {
  const params = new URLSearchParams()
  if (filters?.from) params.set('from', filters.from)
  if (filters?.to)   params.set('to', filters.to)

  return useQuery<Expense[]>({
    queryKey: ['expenses', filters],
    queryFn: () => apiFetch(`/api/expenses?${params.toString()}`),
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateExpenseData) =>
      apiFetch<Expense>('/api/expenses', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['report_pl'] })
      queryClient.invalidateQueries({ queryKey: ['report_balance'] })
    },
  })
}
