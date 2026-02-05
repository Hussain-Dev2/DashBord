'use client'

import { AdminDashboardContent } from '@/components/AdminDashboardContent'
import { ClientsProvider } from '@/contexts/ClientsContext'

// Static page, no server loading
export default function AdminDashboardPage() {
  return (
    <ClientsProvider>
       <AdminDashboardContent />
    </ClientsProvider>
  )
}
