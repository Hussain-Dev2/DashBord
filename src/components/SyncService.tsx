'use client'

import { useEffect, useState } from 'react'
import { db, SyncOperation } from '@/lib/db'
import { toast } from 'sonner'

async function processSyncQueue() {
  const pending = await db.syncQueue.toArray()
  if (pending.length === 0) return

  console.log(`[Sync] Processing ${pending.length} pending operations...`)
  toast.info(`Syncing ${pending.length} offline changes...`)

  for (const op of pending) {
    try {
      let path = ''
      let method = 'POST'
      let body = op.data

      switch (op.type) {
        case 'ADD_CLIENT':
          path = '/api/clients'
          method = 'POST'
          break
        case 'UPDATE_CLIENT':
          path = `/api/clients/${op.clientId}`
          method = 'PATCH'
          break
        case 'DELETE_CLIENT':
          path = `/api/clients/${op.clientId}`
          method = 'DELETE'
          body = undefined
          break
        case 'UPDATE_STATUS':
          path = `/api/clients/${op.clientId}`
          method = 'PATCH'
          body = { status: op.data.status }
          break
        case 'ADD_NOTE':
          path = `/api/clients/${op.clientId}/note`
          method = 'POST'
          break
        case 'ADD_PAYMENT':
          path = `/api/clients/${op.clientId}/payment`
          method = 'POST'
          break
        case 'ADD_DEBT':
          path = `/api/clients/${op.clientId}/debt`
          method = 'POST'
          break
      }

      const res = await fetch(path, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      })

      if (res.ok) {
        await db.syncQueue.delete(op.id!)
      } else {
        console.error(`[Sync] Failed op ${op.id}:`, await res.text())
        // Keep in queue to retry later
      }
    } catch (err) {
      console.error(`[Sync] Network error processing op ${op.id}:`, err)
      break // Stop if still offline
    }
  }

  const remaining = await db.syncQueue.count()
  if (remaining === 0) {
    toast.success('Offline changes synced successfully!')
  }
}

export function SyncService() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      processSyncQueue()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Initial check
    if (typeof navigator !== 'undefined' && navigator.onLine) {
      processSyncQueue()
    }

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return null // Headless service
}
