'use server'

// استيراد prisma للتعامل مع قاعدة البيانات
// Import prisma to interact with the database
import { prisma } from '@/lib/prisma'
// استيراد revalidatePath لتحديث البيانات في Next.js
// Import revalidatePath to refresh data in Next.js
import { revalidatePath } from 'next/cache'
// استيراد getServerSession للحصول على بيانات الجلسة الحالية
// Import getServerSession to get current session data
import { getServerSession } from 'next-auth'
// استيراد إعدادات المصادقة
// Import authentication options
import { authOptions } from '@/lib/auth'
// استيراد قائمة المسؤولين والبيانات التجريبية
// Import admin emails and sample data
import { ADMIN_EMAILS, SAMPLE_CLIENTS } from '@/lib/constants'
// استيراد الأنواع البرمجية المستخدمة
// Import TypeScript types
import { SerializedClient, CreateClientData, UpdateClientData, Status } from '@/lib/types'

// وظيفة مساعدة للتحقق مما إذا كان المستخدم مسؤولاً
// Helper function to check if the user is an admin
async function requireAdmin() {
  let session;
  try {
    // الحصول على الجلسة الحالية
    // Get the current session
    session = await getServerSession(authOptions)
  } catch (error) {
    console.warn("Failed to retrieve session:", error)
    return false
  }
  // التحقق مما إذا كان البريد الإلكتروني موجوداً في قائمة المسؤولين
  // Check if the email is in the admin emails list
  return ADMIN_EMAILS.some(
    email => email.toLowerCase() === session?.user?.email?.toLowerCase()
  )
}

// جلب قائمة العملاء
// Fetch the list of clients
export async function getClients(): Promise<SerializedClient[]> {
  const isAdmin = await requireAdmin()

  // إذا لم يكن مسؤولاً، يتم إرجاع البيانات التجريبية
  // If not an admin, return sample demo data
  if (!isAdmin) {
    return SAMPLE_CLIENTS as any as SerializedClient[]
  }

  try {
    // جلب العملاء من قاعدة البيانات مع الملاحظات وآخر عملية دفع
    // Fetch clients from DB with notes and the latest payment
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

    // تحويل البيانات لتناسب الواجهة الأمامية (تجنب مشاكل Decimal)
    // Map data to fit frontend (avoid Decimal issues)
    return clients.map((client: any) => {
        const lastPaymentDate = client.payments?.[0]?.date
        
        return {
            ...client,
            priceQuoted: client.priceQuoted?.toNumber() ?? 0,
            amountPaid: client.amountPaid?.toNumber() ?? 0,
            createdAt: client.createdAt.toISOString(),
            updatedAt: client.updatedAt.toISOString(),
            lastPayment: lastPaymentDate?.toISOString() ?? null,
            payments: undefined 
        }
    })
  } catch (error) {
    console.error("Database Error: Failed to fetch clients. Falling back to sample data.", error)
    return SAMPLE_CLIENTS as any as SerializedClient[]
  }
}

// جلب بيانات عميل واحد بواسطة المعرف
// Fetch single client data by ID
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
      payments: c.payments.map((p: any) => ({
          ...p,
          amount: p.amount.toNumber(),
      })) as any
    }
  } catch (error) {
    console.error(`Database Error: Failed to fetch client ${id}. Checking sample data.`, error)
    return (SAMPLE_CLIENTS.find(c => c.id === id) as any) || null
  }
}

// إنشاء عميل جديد
// Create a new client
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
  // تحديث المسار لتظهر البيانات الجديدة
  // Refresh path to show new data
  revalidatePath('/admin')
}

// تحديث حالة العميل (مثل: قيد التنفيذ، مكتمل)
// Update client status (e.g., ACTIVE, PENDING)
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

// إضافة ملاحظة جديدة للعميل
// Add a new note to a client
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

// إضافة عملية دفع جديدة
// Add a new payment record
export async function addPayment(clientId: string, amount: number) {
  if (!(await requireAdmin())) {
    throw new Error("Unauthorized")
  }

  // 1. إنشاء سجل الدفع
  // Create the payment record
  await (prisma as any).payment.create({
    data: {
      amount,
      clientId,
      date: new Date()
    }
  })

  // 2. تحديث إجمالي المبلغ المدفوع للعميل
  // Update the client's total amount paid
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

// تحديث كافة بيانات العميل
// Update all client data
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

// حذف عميل من القائمة
// Delete a client from the list
export async function deleteClient(id: string) {
  if (!(await requireAdmin())) {
    throw new Error("Unauthorized")
  }

  await prisma.client.delete({
    where: { id }
  })
  revalidatePath('/admin')
}
