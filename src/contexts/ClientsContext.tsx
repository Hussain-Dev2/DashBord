'use client'

// استيراد أدوات React الأساسية
// Import core React hooks and utilities
import React, { createContext, useContext, useState, useEffect } from 'react'
// استيراد أداة الجلسة من NextAuth
// Import session hook from NextAuth
import { useSession } from 'next-auth/react'
// استيراد أداة التوجيه من Next.js
// Import router hook from Next.js
import { useRouter } from 'next/navigation'
// استيراد أداة الإشعارات (Toast)
// Import toast notifications library
import { toast } from 'sonner' 
// استيراد وظائف الخادم (Server Actions) للتعامل مع العملاء
// Import server actions for client management
import { createClient, updateClient, deleteClient as deleteClientAction, updateClientStatus, addPayment, addNote } from '@/app/actions'
// استيراد أنواع البيانات
// Import data types
import { Status } from '@prisma/client'
import { SerializedClient } from '@/lib/types'

// تعريف نوع العميل المدمج مع الملاحظات
// Define client type with notes
export type ClientWithNotes = SerializedClient

// تعريف واجهة سياق العملاء (Context API)
// Define the interface for the Clients Context
interface ClientsContextType {
  clients: ClientWithNotes[] // قائمة العملاء
  addClient: (data: any) => Promise<void> // إضافة عميل
  updateClientFn: (id: string, data: any) => Promise<void> // تحديث بيانات عميل
  deleteClientFn: (id: string) => Promise<void> // حذف عميل
  updateStatusFn: (id: string, status: Status) => Promise<void> // تحديث حالة العميل
  addPaymentFn: (clientId: string, amount: number) => Promise<void> // إضافة دفعة مالية
  addNoteFn: (clientId: string, content: string) => Promise<void> // إضافة ملاحظة
  resetDemoData: () => void // إعادة ضبط البيانات التجريبية
  isLoading: boolean // حالة التحميل
}

// إنشاء السياق (Context)
// Create the Context
const ClientsContext = createContext<ClientsContextType | undefined>(undefined)

// موفر سياق العملاء الذي يغلف التطبيق
// Clients Provider component that wraps the application
export function ClientsProvider({ 
  children, 
  initialClients 
}: { 
  children: React.ReactNode
  initialClients: ClientWithNotes[] 
}) {
  const { data: session } = useSession() // الحصول على بيانات الجلسة
  const router = useRouter() // استخدام الموجه
  const [clients, setClients] = useState<ClientWithNotes[]>(initialClients) // حالة العملاء
  const [isLoading, setIsLoading] = useState(false) // حالة التحميل

  const isAdmin = session?.user?.isAdmin // هل المستخدم مدير؟

  // تهيئة البيانات من التخزين المحلي (LocalStorage) للمستخدمين التجريبيين
  // Initialize from LocalStorage for Demo Users
  useEffect(() => {
    if (session?.user && !isAdmin) {
      const stored = localStorage.getItem('demo_clients')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          setClients(parsed)
        } catch (e) {
          console.error("Failed to parse demo clients", e)
        }
      } else {
        // إذا لم توجد بيانات مخزنة، استخدم البيانات الأولية
        // If no stored data, use initialClients (Sample Clients)
        setClients(initialClients)
      }
    } else {
      // للمديرين: دائمًا التزامن مع الخادم
      // For Admin: Always sync with server state
      setClients(initialClients)
    }
  }, [session, isAdmin, initialClients])

  // حفظ التغيرات في التخزين المحلي للمستخدمين التجريبيين
  // Persist to LocalStorage whenever clients change (for Demo users)
  useEffect(() => {
    if (session?.user && !isAdmin && clients.length > 0) {
      localStorage.setItem('demo_clients', JSON.stringify(clients))
    }
  }, [clients, session, isAdmin])

  // وظيفة إضافة عميل جديد
  // Function to add a new client
  const addClient = React.useCallback(async (data: any) => {
    setIsLoading(true)
    if (isAdmin) {
      try {
        await createClient(data)
        router.refresh()
        toast.success('Client created successfully')
      } catch (error) {
        toast.error('Failed to create client')
      }
    } else {
      // وضع التجربة (Demo Mode)
      const newClient: ClientWithNotes = {
        ...data,
        id: `demo-${Date.now()}`,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: [],
        priceQuoted: Number(data.priceQuoted) || 0,
        amountPaid: Number(data.amountPaid) || 0,
      } as any 
      setClients(prev => [newClient, ...prev])
      toast.success('Demo: Client created (Local Only)')
    }
    setIsLoading(false)
  }, [isAdmin, router])

  // وظيفة تحديث بيانات عميل
  // Function to update client data
  const updateClientFn = React.useCallback(async (id: string, data: any) => {
    setIsLoading(true)
    if (isAdmin) {
      try {
        await updateClient(id, data)
        router.refresh()
        toast.success('Client updated')
      } catch (error) {
        toast.error('Failed to update client')
      }
    } else {
      // وضع التجربة
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
      toast.success('Demo: Client updated (Local Only)')
    }
    setIsLoading(false)
  }, [isAdmin, router])

  // وظيفة تحديث حالة العميل
  // Function to update client status
  const updateStatusFn = React.useCallback(async (id: string, status: Status) => {
    if (isAdmin) {
      try {
        await updateClientStatus(id, status)
        router.refresh()
        toast.success('Status updated')
      } catch (error) {
        toast.error('Failed to update status')
      }
    } else {
       // وضع التجربة
       setClients(prev => prev.map(c => c.id === id ? { ...c, status } : c))
       toast.success('Demo: Status updated (Local Only)')
    }
  }, [isAdmin, router])

  // وظيفة إضافة دفعة مالية
  // Function to add a payment
  const addPaymentFn = React.useCallback(async (clientId: string, amount: number) => {
    setIsLoading(true)
    if (isAdmin) {
      try {
        await addPayment(clientId, amount)
        router.refresh()
        toast.success('Payment added')
      } catch (error) {
        toast.error('Failed to add payment')
      }
    } else {
      // وضع التجربة
      setClients(prev => prev.map(c => {
        if (c.id === clientId) {
          return {
            ...c,
            amountPaid: Number(c.amountPaid) + amount,
            updatedAt: new Date().toISOString()
          }
        }
        return c
      }))
      toast.success('Demo: Payment added (Local Only)')
    }
    setIsLoading(false)
  }, [isAdmin, router])

  // وظيفة إضافة ملاحظة
  // Function to add a note
  const addNoteFn = React.useCallback(async (clientId: string, content: string) => {
    setIsLoading(true)
    if (isAdmin) {
      try {
        await addNote(clientId, content)
        router.refresh()
        toast.success('Note added')
      } catch (error) {
        toast.error('Failed to add note')
      }
    } else {
      // وضع التجربة
      setClients(prev => prev.map(c => {
        if (c.id === clientId) {
          return {
            ...c,
            notes: [
              { id: `demo-note-${Date.now()}`, content, createdAt: new Date().toISOString(), clientId },
              ...(c.notes || [])
            ]
          }
        }
        return c
      }))
      toast.success('Demo: Note added (Local Only)')
    }
    setIsLoading(false)
  }, [isAdmin, router])

  // وظيفة حذف عميل
  // Function to delete a client
  const deleteClientFn = React.useCallback(async (id: string) => {
    setIsLoading(true)
    if (isAdmin) {
      try {
        await deleteClientAction(id)
        router.refresh()
        toast.success('Client deleted')
      } catch (error) {
        toast.error('Failed to delete client')
      }
    } else {
      // وضع التجربة
      setClients(prev => prev.filter(c => c.id !== id))
      toast.success('Demo: Client deleted (Local Only)')
    }
    setIsLoading(false)
  }, [isAdmin, router])

  // وظيفة إعادة ضبط البيانات (للمستخدمين التجريبيين فقط)
  // Function to reset demo data
  const resetDemoData = React.useCallback(() => {
    if (isAdmin) return
    localStorage.removeItem('demo_clients')
    setClients([]) 
    toast.info('Demo data cleared')
  }, [isAdmin])

  // تحسين الأداء باستخدام useMemo لقيمة السياق
  // Optimize performance using useMemo for context value
  const value = React.useMemo(() => ({
    clients, 
    addClient, 
    updateClientFn, 
    deleteClientFn, 
    updateStatusFn,
    addPaymentFn,
    addNoteFn,
    resetDemoData,
    isLoading 
  }), [clients, addClient, updateClientFn, deleteClientFn, updateStatusFn, addPaymentFn, addNoteFn, resetDemoData, isLoading])

  return (
    <ClientsContext.Provider value={value}>
      {children}
    </ClientsContext.Provider>
  )
}

// خطاف مخصص لاستخدام سياق العملاء بسهولة
// Custom hook for easier access to Clients Context
export function useClients() {
  const context = useContext(ClientsContext)
  if (context === undefined) {
    throw new Error('useClients must be used within a ClientsProvider')
  }
  return context
}
