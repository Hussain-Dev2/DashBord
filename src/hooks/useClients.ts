import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { SerializedClient, CreateClientData, UpdateClientData, Status } from '@/lib/types'
import { useEffect } from 'react'

export function useClients() {
  const queryClient = useQueryClient()

  const { data: clients = [], isLoading, error } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Client')
        .select(`*, notes(*), payments(*)`)
        .order('updatedAt', { ascending: false })
      
      if (error) throw error
      
      return (data || []).map((client: any) => ({
        ...client,
        priceQuoted: Number(client.priceQuoted),
        amountPaid: Number(client.amountPaid),
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        notes: client.notes || [],
        payments: client.payments || [],
        lastPayment: client.payments?.[0]?.date || null
      })) as SerializedClient[]
    }
  })

  // Realtime Subscription
  useEffect(() => {
    const channel = supabase
      .channel('realtime-clients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Client' }, () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Note' }, () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] })
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Payment' }, () => {
        queryClient.invalidateQueries({ queryKey: ['clients'] })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  // Mutations
  const addClient = useMutation({
    mutationFn: async (data: CreateClientData) => {
       const { error } = await supabase.from('Client').insert({
         ...data,
         status: 'PENDING',
         updatedAt: new Date().toISOString()
       })
       if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
  })

  const updateClient = useMutation({
    mutationFn: async ({id, data}: {id: string, data: UpdateClientData}) => {
       const { error } = await supabase.from('Client').update({
         ...data,
         updatedAt: new Date().toISOString()
       }).eq('id', id)
       if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
  })
  
  const deleteClient = useMutation({
    mutationFn: async (id: string) => {
       const { error } = await supabase.from('Client').delete().eq('id', id)
       if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
  })

  const updateStatus = useMutation({
      mutationFn: async ({id, status}: {id: string, status: Status}) => {
           const { error } = await supabase.from('Client').update({ status, updatedAt: new Date().toISOString() }).eq('id', id)
           if (error) throw error
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
  })

  const addNote = useMutation({
      mutationFn: async ({clientId, content}: {clientId: string, content: string}) => {
           const { error } = await supabase.from('Note').insert({ clientId, content })
           if (error) throw error
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
  })

   const addPayment = useMutation({
      mutationFn: async ({clientId, amount}: {clientId: string, amount: number}) => {
          // 1. Create payment
          const { error: payError } = await supabase.from('Payment').insert({ clientId, amount, date: new Date().toISOString() })
          if (payError) throw payError
          
          // 2. Manually update client amountPaid (Logic moved to client due to no server actions)
          const { data: client } = await supabase.from('Client').select('amountPaid').eq('id', clientId).single()
          const newAmount = (Number(client?.amountPaid) || 0) + amount
           
          const { error: updateError } = await supabase.from('Client').update({ amountPaid: newAmount, updatedAt: new Date().toISOString() }).eq('id', clientId)
          if (updateError) throw updateError
      },
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ['clients'] })
  })

  return {
    clients,
    isLoading,
    error,
    addClient,
    updateClient,
    deleteClient,
    updateStatus,
    addNote,
    addPayment
  }
}
