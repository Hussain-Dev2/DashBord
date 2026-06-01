import { Prisma, Client as PrismaClient, Status as PrismaStatus } from '@prisma/client'

// Re-export Status for easy access
export type Status = PrismaStatus

// Define the shape of our Client with relations included
export type ClientWithRelations = Prisma.ClientGetPayload<{
  include: {
    notes: true
    payments: true
  }
}>

// Serialized Note (dates as strings)
export interface SerializedNote {
  id: string
  content: string
  createdAt: string
  clientId: string
}

// Serialized Payment (amounts as numbers, dates as strings)
export interface SerializedPayment {
  id: string
  amount: number
  date: string
  clientId: string
  type?: 'PAYMENT' | 'DEBT'
}

// Define the shape of the Client we send to the frontend (serialized)
export type SerializedClient = Omit<PrismaClient, 'priceQuoted' | 'amountPaid' | 'createdAt' | 'updatedAt'> & {
  priceQuoted: number
  amountPaid: number
  createdAt: string
  updatedAt: string
  notes?: SerializedNote[]
  lastPayment?: string | null
  payments?: SerializedPayment[]
}

export interface CreateClientData {
  name: string
  industry?: string
  phone?: string
  logoUrl?: string
  projectUrl?: string
  repoUrl?: string
  priceQuoted?: number
  amountPaid?: number
}

export interface UpdateClientData {
  name?: string
  industry?: string | null
  phone?: string | null
  logoUrl?: string | null
  projectUrl?: string | null
  repoUrl?: string | null
  status?: Status
  priceQuoted?: number
  amountPaid?: number
}

// ─────────────────────────────────────────────────────────────
// ACCOUNTING MODULE TYPES
// ─────────────────────────────────────────────────────────────

export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense'
export type PaymentMethodType = 'Cash' | 'Bank' | 'Card'
export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'unpaid'
export type BillingCycle = 'one_time' | 'monthly' | 'yearly'
export type JournalReferenceType = 'payment' | 'debt' | 'expense' | 'subscription' | 'manual'

// Chart of Accounts
export interface Account {
  id: string
  account_number: string
  name: string
  type: AccountType
  created_at: string
}

// Journal Entry (header)
export interface JournalEntry {
  id: string
  date: string
  description: string
  reference_id?: string | null
  reference_type?: JournalReferenceType | null
  created_at: string
  items?: JournalItem[]
}

// Journal Line Item (debit/credit row)
export interface JournalItem {
  id: string
  journal_entry_id: string
  account_id: string
  debit: number
  credit: number
  account?: Account
}

// Product / Service Catalog
export interface Product {
  id: string
  name: string
  description?: string | null
  default_price: number
  tax_rate: number        // 0 = no tax, 15 = 15% VAT
  revenue_account_id?: string | null
  created_at: string
}

export interface CreateProductData {
  name: string
  description?: string
  default_price: number
  tax_rate?: number
  revenue_account_id?: string
}

// Invoice Line Item (used in ClientInvoice UI, not persisted separately)
export interface InvoiceLineItem {
  product_id?: string
  description: string
  quantity: number
  unit_price: number
  tax_rate: number       // per-line tax override
}

// Expense
export interface Expense {
  id: string
  category_account_id: string
  amount: number
  payment_method: PaymentMethodType
  date: string
  description?: string | null
  receipt_url?: string | null
  journal_entry_id?: string | null
  created_at: string
  account?: Account      // joined
}

export interface CreateExpenseData {
  category_account_id: string
  amount: number
  payment_method: PaymentMethodType
  date: string
  description?: string
  receipt_url?: string
}

// Subscription
export interface Subscription {
  id: string
  client_id: string
  status: SubscriptionStatus
  billing_cycle: BillingCycle
  price: number
  product_id?: string | null
  start_date: string
  next_billing_date?: string | null
  canceled_at?: string | null
  created_at: string
  product?: Product      // joined
}

export interface CreateSubscriptionData {
  client_id: string
  billing_cycle: BillingCycle
  price: number
  product_id?: string
  start_date?: string
}

// Financial Report Types
export interface PLStatement {
  dateFrom: string
  dateTo: string
  totalRevenue: number
  totalExpenses: number
  netProfit: number
  revenueByAccount: { account: Account; total: number }[]
  expensesByAccount: { account: Account; total: number }[]
}

export interface BalanceSheet {
  asOf: string
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  isBalanced: boolean    // Assets === Liabilities + Equity
  byAccount: { account: Account; balance: number }[]
}
