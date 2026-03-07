import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

// POST /api/clients/[id]/debt — add a debt record to history
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('>>> [API] POST Debt hit')
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { amount } = await req.json()
    console.log(`>>> [API] Adding debt for client ${id}: ${amount}`)
    const supabase = createAdminClient()

    // 1. Insert "negative" payment record to represent debt increase in history
    // We use a negative amount to distinguish it in the history list
    const { error: payError } = await supabase
      .from('Payment')
      .insert({ 
        id: crypto.randomUUID(),
        clientId: id, 
        amount: -Math.abs(Number(amount)), // Force negative
        date: new Date().toISOString() 
      })

    if (payError) {
      console.error('>>> [API] Debt history insert error:', payError)
      return NextResponse.json({ error: payError.message }, { status: 500 })
    }

    // 2. Update client priceQuoted (Total Debt increases)
    const { data: client, error: fetchError } = await supabase
      .from('Client')
      .select('priceQuoted')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('>>> [API] Client fetch error:', fetchError)
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    const newTotal = (Number(client?.priceQuoted) || 0) + Math.abs(Number(amount))
    console.log(`>>> [API] Updating client priceQuoted to: ${newTotal}`)

    const { error: updateError } = await supabase
      .from('Client')
      .update({ priceQuoted: newTotal, updatedAt: new Date().toISOString() })
      .eq('id', id)

    if (updateError) {
      console.error('>>> [API] Client update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, newTotal })
  } catch (err: any) {
    console.error('>>> [API] Debt server error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
