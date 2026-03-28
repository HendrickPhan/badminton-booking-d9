import { getDB } from '@/lib/db'
import { getSession } from '@/lib/auth-session'
import { NextRequest, NextResponse } from 'next/server'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; participantId: string }> }
) {
  const { id: bookingId, participantId } = await params
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only admin can remove participants
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
  }

  const db = getDB()
  const { error } = await db
    .from('booking_participants')
    .delete()
    .eq('id', participantId)
    .eq('booking_id', bookingId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
