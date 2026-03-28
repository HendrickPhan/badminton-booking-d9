import { getDB } from '@/lib/db'
import { getSession } from '@/lib/auth-session'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { status, user_id } = await request.json()
  const db = getDB()

  // Determine which user_id to use
  // Admin can specify user_id to add other users
  // Regular users can only add themselves
  let targetUserId = session.id
  if (user_id && session.role === 'admin') {
    targetUserId = user_id
  }

  // Check if already participating
  const { data: existing } = await db
    .from('booking_participants')
    .select('*')
    .eq('booking_id', bookingId)
    .eq('user_id', targetUserId)
    .single()

  if (existing) {
    // Update existing
    const { error } = await db
      .from('booking_participants')
      .update({ status } as never)
      .eq('id', (existing as { id: string }).id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  } else {
    // Create new
    const { error } = await db.from('booking_participants').insert({
      booking_id: bookingId,
      user_id: targetUserId,
      status,
    } as never)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
  }

  return NextResponse.json({ success: true })
}
