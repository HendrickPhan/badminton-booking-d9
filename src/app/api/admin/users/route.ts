import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-session'
import { getDB } from '@/lib/db'

async function checkAdmin() {
  const session = await getSession()
  if (!session) {
    return { authorized: false, error: 'Unauthorized', status: 401 }
  }
  if (session.role !== 'admin') {
    return { authorized: false, error: 'Forbidden', status: 403 }
  }
  return { authorized: true, session }
}

// Get all users
export async function GET() {
  const adminCheck = await checkAdmin()
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  const db = getDB()
  const { data, error } = await db
    .from('users')
    .select('id, username, email, avatar_url, gender, role, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ users: data })
}

// Create user
export async function POST(request: NextRequest) {
  const adminCheck = await checkAdmin()
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  const { email, password, username, role, gender } = await request.json()

  if (!username || !password || !role) {
    return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 })
  }

  const db = getDB()

  const { data, error } = await db
    .from('users')
    .insert({
      username,
      email: email || null,
      password_hash: password,
      gender: gender || null,
      role,
    } as never)
    .select('id, username, email, avatar_url, gender, role, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, user: data })
}

// Delete user
export async function DELETE(request: NextRequest) {
  const adminCheck = await checkAdmin()
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  const { userId } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: 'Thiếu userId' }, { status: 400 })
  }

  const db = getDB()
  const { error } = await db.from('users').delete().eq('id', userId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}

// Update user
export async function PUT(request: NextRequest) {
  const adminCheck = await checkAdmin()
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  const { userId, username, email, role, gender, password } = await request.json()

  if (!userId) {
    return NextResponse.json({ error: 'Thiếu userId' }, { status: 400 })
  }

  const db = getDB()

  const updateData: Record<string, unknown> = {
    username,
    email: email || null,
    gender: gender || null,
    role,
  }

  // Only update password if provided
  if (password) {
    updateData.password_hash = password
  }

  const { data, error } = await db
    .from('users')
    .update(updateData as never)
    .eq('id', userId)
    .select('id, username, email, avatar_url, gender, role, created_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, user: data })
}
