import { Prisma, Client as PrismaClient, Status as PrismaStatus } from '@prisma/client'

// Re-export Status for easy access
export type Status = PrismaStatus

// Define the shape of our Client with relations included
// This matches what we ask for in prisma.client.findMany({ include: ... })
export type ClientWithRelations = Prisma.ClientGetPayload<{
  include: {
    notes: true
    payments: true
  }
}>

// Define the shape of the Client we send to the frontend (serialized)
// Decimal types are converted to numbers, Dates to strings
export type SerializedClient = Omit<PrismaClient, 'priceQuoted' | 'amountPaid' | 'createdAt' | 'updatedAt'> & {
  priceQuoted: number
  amountPaid: number
  createdAt: string
  updatedAt: string
  notes?: any[] // We can refine this if needed
  lastPayment?: string | null
  payments?: any[]
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
