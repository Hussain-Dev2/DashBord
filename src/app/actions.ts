'use server'

import { prisma } from '@/lib/prisma'
import { Status, Client } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getClients() {
  const clients = await prisma.client.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { notes: true }
  })
  return clients.map(client => ({
    ...client,
    priceQuoted: client.priceQuoted?.toNumber() ?? 0,
    amountPaid: client.amountPaid?.toNumber() ?? 0,
  }))
}

export async function getClient(id: string) {
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
  await prisma.client.update({
    where: { id },
    data: { status }
  })
  revalidatePath(`/admin/clients/${id}`)
  revalidatePath('/admin')
}

export async function addNote(clientId: string, content: string) {
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
  await prisma.client.delete({
    where: { id }
  })
  revalidatePath('/admin')
}
