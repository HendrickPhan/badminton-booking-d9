import { getDB } from '@/lib/db'
import { getSession } from '@/lib/auth-session'
import { NextRequest, NextResponse } from 'next/server'

async function checkAdmin() {
  const session = await getSession()
  if (!session) {
    return { authorized: false, error: 'Unauthorized', status: 401 }
  }
  if (session.role !== 'admin') {
    return { authorized: false, error: 'Forbidden', status: 403 }
  }
  return { authorized: true }
}

export async function GET() {
  const db = getDB()
  const { data, error } = await db
    .from('centers')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ centers: data })
}

export async function POST(request: NextRequest) {
  const adminCheck = await checkAdmin()
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  const { name, address, latitude, longitude } = await request.json()

  if (!name) {
    return NextResponse.json({ error: 'Tên sân là bắt buộc' }, { status: 400 })
  }

  const db = getDB()
  const { data, error } = await db
    .from('centers')
    .insert({
      name,
      address: address || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    } as never)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, center: data })
}

export async function PUT(request: NextRequest) {
  const adminCheck = await checkAdmin()
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  const { id, name, address, latitude, longitude } = await request.json()

  if (!id || !name) {
    return NextResponse.json({ error: 'Thiếu thông tin' }, { status: 400 })
  }

  const db = getDB()
  const { data, error } = await db
    .from('centers')
    .update({
      name,
      address: address || null,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    } as never)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, center: data })
}

export async function DELETE(request: NextRequest) {
  const adminCheck = await checkAdmin()
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  const { id } = await request.json()

  if (!id) {
    return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 })
  }

  const db = getDB()
  const { error } = await db.from('centers').delete().eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
