
import { getClients } from '@/app/actions'
import { AdminDashboardContent } from '@/components/AdminDashboardContent'
import { ClientsProvider } from '@/contexts/ClientsContext'

export default async function AdminDashboardPage() {
  // This runs on the server. getClients uses session to determine if it returns DB data or Sample data.
  const initialClients = await getClients()

  return (
    <ClientsProvider initialClients={initialClients as any[]}>
       <AdminDashboardContent />
    </ClientsProvider>
  )
}
