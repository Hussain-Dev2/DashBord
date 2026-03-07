import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'
import crypto from 'crypto'

// POST /api/clients/[id]/note — add a note
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  console.log('>>> [API] POST Note hit')
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const { content } = await req.json()
    console.log(`>>> [API] Adding note for client ${id}`)
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('Note')
      .insert({ 
        id: crypto.randomUUID(),
        clientId: id, 
        content 
      })
      .select()
      .single()

    if (error) {
      console.error('>>> [API] Note insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('>>> [API] Note added successfully')
    return NextResponse.json(data, { status: 201 })
  } catch (err: any) {
    console.error('>>> [API] Note server error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
