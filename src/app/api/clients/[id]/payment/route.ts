import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

// POST /api/clients/[id]/payment — add a payment
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('>>> [API] POST Payment hit')
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { amount } = await req.json()
    console.log(`>>> [API] Adding payment for client ${id}: ${amount}`)
    const supabase = createAdminClient()

    // 1. Insert payment record
    const { error: payError } = await supabase
      .from('Payment')
      .insert({ 
        id: crypto.randomUUID(),
        clientId: id, 
        amount: Number(amount), 
        date: new Date().toISOString() 
      })

    if (payError) {
      console.error('>>> [API] Payment insert error:', payError)
      return NextResponse.json({ error: payError.message }, { status: 500 })
    }

    // 2. Update client amountPaid
    const { data: client, error: fetchError } = await supabase
      .from('Client')
      .select('amountPaid')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('>>> [API] Client fetch error:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const newAmount = (Number(client?.amountPaid) || 0) + Number(amount)
    console.log(`>>> [API] Updating client amountPaid to: ${newAmount}`)

    const { error: updateError } = await supabase
      .from('Client')
      .update({ amountPaid: newAmount, updatedAt: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      console.error('>>> [API] Client update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, newAmount })
  } catch (err: any) {
    console.error('>>> [API] Payment server error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
