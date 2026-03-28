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
  return { authorized: true, session }
}

// Get settings
export async function GET() {
  const adminCheck = await checkAdmin()
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  const db = getDB()
  const { data, error } = await db
    .from('settings')
    .select('*')
    .eq('id', 1)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ settings: data })
}

// Update settings
export async function PUT(request: NextRequest) {
  const adminCheck = await checkAdmin()
  if (!adminCheck.authorized) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status })
  }

  const { female_discount_percent, female_discount_enabled } = await request.json()

  const db = getDB()
  const { data, error } = await db
    .from('settings')
    .update({
      female_discount_percent,
      female_discount_enabled,
      updated_at: new Date().toISOString(),
    } as never)
    .eq('id', 1)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, settings: data })
}
