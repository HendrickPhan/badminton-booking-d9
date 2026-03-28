import { getDB } from '@/lib/db'
import { getSession } from '@/lib/auth-session'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const db = getDB()
  const { data, error } = await db
    .from('users')
    .select('id, username, email, avatar_url, gender, role, created_at')
    .eq('id', session.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ profile: data })
}

export async function PUT(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { username, avatar_url, gender } = await request.json()

  const db = getDB()
  const { error } = await db
    .from('users')
    .update({
      username,
      avatar_url: avatar_url || null,
      gender: gender || null,
    } as never)
    .eq('id', session.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
