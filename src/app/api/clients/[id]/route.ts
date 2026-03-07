import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase'

type Params = { params: Promise<{ id: string }> }

// PATCH /api/clients/[id] — update client
export async function PATCH(req: NextRequest, { params }: Params) {
  console.log('>>> [API] PATCH Client hit')
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()
    console.log(`>>> [API] Updating client ${id}`)
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('Client')
      .update({ ...body, updatedAt: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('>>> [API] Client update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('>>> [API] Client updated successfully')
    return NextResponse.json(data)
  } catch (err: any) {
    console.error('>>> [API] PATCH server error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// DELETE /api/clients/[id] — delete client
export async function DELETE(_req: NextRequest, { params }: Params) {
  console.log('>>> [API] DELETE Client hit')
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    console.log(`>>> [API] Deleting client ${id}`)
    const supabase = createAdminClient()

    const { error } = await supabase.from('Client').delete().eq('id', id)
    if (error) {
      console.error('>>> [API] Client delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    console.log('>>> [API] Client deleted successfully')
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('>>> [API] DELETE server error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
