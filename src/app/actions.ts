'use server'

import { prisma } from '@/lib/prisma'
import { Status, Client } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ADMIN_EMAIL, SAMPLE_CLIENTS } from '@/lib/constants'

export async function getClients() {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  if (!isAdmin) {
    return SAMPLE_CLIENTS
  }

  try {
    const clients = await prisma.client.findMany({
      orderBy: { updatedAt: 'desc' },
      include: { notes: true }
    })
    return clients.map(client => ({
      ...client,
      priceQuoted: client.priceQuoted?.toNumber() ?? 0,
      amountPaid: client.amountPaid?.toNumber() ?? 0,
    }))
  } catch (error) {
    console.error("Database Error: Failed to fetch clients. Falling back to sample data.", error)
    return SAMPLE_CLIENTS
  }
}

export async function getClient(id: string) {
  const session = await getServerSession(authOptions)
  const isAdmin = session?.user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()

  if (!isAdmin) {
    return SAMPLE_CLIENTS.find(c => c.id === id) || null
  }

  try {
    const client = await prisma.client.findUnique({
      where: { id },
      include: { notes: { orderBy: { createdAt: 'desc' } } }
    })
    
    if (!client) return null
    
    return {
      ...client,
      priceQuoted: client.priceQuoted?.toNumber() ?? 0,
      amountPaid: client.amountPaid?.toNumber() ?? 0,
    }
  } catch (error) {
    console.error(`Database Error: Failed to fetch client ${id}. Checking sample data.`, error)
    return SAMPLE_CLIENTS.find(c => c.id === id) || null
  }
}

export async function createClient(data: {
  name: string
  industry?: string
  phone?: string
  logoUrl?: string
  projectUrl?: string
  repoUrl?: string
  priceQuoted?: number
  amountPaid?: number
}) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
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
  const session = await getServerSession(authOptions)
  if (session?.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
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
  const session = await getServerSession(authOptions)
  if (session?.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
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

export async function updateClient(id: string, data: {
  name?: string
  industry?: string | null
  phone?: string | null
  logoUrl?: string | null
  projectUrl?: string | null
  repoUrl?: string | null
  status?: Status
  priceQuoted?: number
  amountPaid?: number
}) {
  const session = await getServerSession(authOptions)
  if (session?.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
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
  const session = await getServerSession(authOptions)
  if (session?.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    throw new Error("Unauthorized")
  }

  await prisma.client.delete({
    where: { id }
  })
  revalidatePath('/admin')
}
