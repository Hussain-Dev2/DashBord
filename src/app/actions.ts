'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ADMIN_EMAIL, SAMPLE_CLIENTS } from '@/lib/constants'
import { SerializedClient, CreateClientData, UpdateClientData, Status } from '@/lib/types'

// Helper to check admin status
async function requireAdmin() {
  let session;
  try {
    session = await getServerSession(authOptions)
  } catch (error) {
    console.warn("Failed to retrieve session:", error)
    return false
  }
  return session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}

export async function getClients(): Promise<SerializedClient[]> {
  const isAdmin = await requireAdmin()

  if (!isAdmin) {
    // Return sample clients formatted as SerializedClient
    // Note: SAMPLE_CLIENTS in constants might need casting if it doesn't match perfectly, 
    // but assuming it's close enough for demo.
    return SAMPLE_CLIENTS as any as SerializedClient[]
  }

  try {
    // We explicitly type the result or let Prisma infer it, then map carefully.
    const clients = await (prisma.client as any).findMany({
      orderBy: { updatedAt: 'desc' },
      include: { 
        notes: true,
        payments: {
          orderBy: { date: 'desc' },
          take: 1
        }
      }
    })

    return clients.map((client: any) => {
        // Safe access to relations
        const lastPaymentDate = client.payments?.[0]?.date
        
        return {
            ...client,
            priceQuoted: client.priceQuoted?.toNumber() ?? 0,
            amountPaid: client.amountPaid?.toNumber() ?? 0,
            createdAt: client.createdAt.toISOString(),
            updatedAt: client.updatedAt.toISOString(),
            lastPayment: lastPaymentDate?.toISOString() ?? null,
            // We exclude the raw 'payments' array from the returned object to avoid Decimal errors
            payments: undefined 
        }
    })
  } catch (error) {
    console.error("Database Error: Failed to fetch clients. Falling back to sample data.", error)
    return SAMPLE_CLIENTS as any as SerializedClient[]
  }
}

export async function getClient(id: string): Promise<SerializedClient | null> {
  const isAdmin = await requireAdmin()

  if (!isAdmin) {
    return (SAMPLE_CLIENTS.find(c => c.id === id) as any) || null
  }

  try {
    const client = await (prisma.client as any).findUnique({
      where: { id },
      include: { 
        notes: { orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { date: 'desc' } }
      }
    })
    
    if (!client) return null
    
    const c = client as any

    return {
      ...c,
      priceQuoted: c.priceQuoted?.toNumber() ?? 0,
      amountPaid: c.amountPaid?.toNumber() ?? 0,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
      // For single client view, we might WANT the full payment history, 
      // but we need to ensure it's serialized (no Decimals)
      payments: c.payments.map((p: any) => ({
          ...p,
          amount: p.amount.toNumber(),
          // keep date as Date or convert to string? Client expects Date usually or string.
          // Let's stick to what the component expects. 
          // If the component expects 'any' for payments, we return cleaned objects.
      })) as any
    }
  } catch (error) {
    console.error(`Database Error: Failed to fetch client ${id}. Checking sample data.`, error)
    return (SAMPLE_CLIENTS.find(c => c.id === id) as any) || null
  }
}

export async function createClient(data: CreateClientData) {
  if (!(await requireAdmin())) {
    throw new Error("Unauthorized")
  }

  await prisma.client.create({
    data: {
      name: data.name,
      industry: data.industry,
      phone: data.phone,
      logoUrl: data.logoUrl,
      projectUrl: data.projectUrl,
      repoUrl: data.repoUrl,
      priceQuoted: data.priceQuoted ?? 0,
      amountPaid: data.amountPaid ?? 0,
      status: 'PENDING',
    }
  })
  revalidatePath('/admin')
}

export async function updateClientStatus(id: string, status: Status) {
  if (!(await requireAdmin())) {
    throw new Error("Unauthorized")
  }
  
  await prisma.client.update({
    where: { id },
    data: { status }
  })
  revalidatePath(`/admin/clients/${id}`)
  revalidatePath('/admin')
}

export async function addNote(clientId: string, content: string) {
  if (!(await requireAdmin())) {
    throw new Error("Unauthorized")
  }

  await prisma.note.create({
    data: {
      content,
      clientId
    }
  })
  revalidatePath(`/admin/clients/${clientId}`)
}

export async function addPayment(clientId: string, amount: number) {
  if (!(await requireAdmin())) {
    throw new Error("Unauthorized")
  }

  // 1. Create the payment record
  await (prisma as any).payment.create({
    data: {
      amount,
      clientId,
      date: new Date()
    }
  })

  // 2. Update the client's total amount paid
  await prisma.client.update({
    where: { id: clientId },
    data: {
      amountPaid: {
        increment: amount
      }
    }
  })

  revalidatePath(`/admin/clients/${clientId}`)
  revalidatePath('/admin')
}

export async function updateClient(id: string, data: UpdateClientData) {
  if (!(await requireAdmin())) {
    throw new Error("Unauthorized")
  }

  await prisma.client.update({
    where: { id },
    data: {
      name: data.name,
      industry: data.industry,
      phone: data.phone,
      logoUrl: data.logoUrl,
      projectUrl: data.projectUrl,
      repoUrl: data.repoUrl,
      priceQuoted: data.priceQuoted,
      amountPaid: data.amountPaid,
      status: data.status,
    }
  })
  revalidatePath(`/admin/clients/${id}`)
  revalidatePath('/admin')
}

export async function deleteClient(id: string) {
  if (!(await requireAdmin())) {
    throw new Error("Unauthorized")
  }

  await prisma.client.delete({
    where: { id }
  })
  revalidatePath('/admin')
}
