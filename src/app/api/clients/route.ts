import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

// GET /api/clients — fetch all clients (admin only)
export async function GET() {
  console.log('>>> [API] GET /api/clients hit')
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    console.log('>>> [API] GET Unauthorized')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('Client')
      .select('*, Note(*), Payment(*)')
      .order('updatedAt', { ascending: false })

    if (error) {
      console.error('>>> [API] GET Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log(`>>> [API] GET success: ${data?.length || 0} clients found`)
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('>>> [API] GET server error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// POST /api/clients — create client (admin only)
export async function POST(req: NextRequest) {
  console.log('>>> [API] POST /api/clients hit')
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.isAdmin) {
    console.log('>>> [API] Unauthorized')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    console.log('>>> [API] Creating client:', body.name)
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('Client')
      .insert({
        id: crypto.randomUUID(),
        name: body.name,
        industry: body.industry || null,
        phone: body.phone || null,
        logoUrl: body.logoUrl || null,
        projectUrl: body.projectUrl || null,
        repoUrl: body.repoUrl || null,
        priceQuoted: Number(body.priceQuoted) || 0,
        amountPaid: Number(body.amountPaid) || 0,
        status: 'PENDING',
        updatedAt: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error('>>> [API] Supabase error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('>>> [API] Client created successfully')
    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    console.error('>>> [API] Server error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
