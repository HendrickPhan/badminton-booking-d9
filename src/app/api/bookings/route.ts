import { getDB } from '@/lib/db'
import { getSession } from '@/lib/auth-session'
import { NextRequest, NextResponse } from 'next/server'

interface Booking {
  id: string
  center_id: string | null
  match_date: string
  start_time: string
  end_time: string
  courts_count: number
  court_price: number
  status: string
  created_at: string
  [key: string]: unknown
}

interface Center {
  id: string
  name: string
  [key: string]: unknown
}

interface Participant {
  booking_id: string
  status: string
  [key: string]: unknown
}

export async function GET(request: NextRequest) {
  const db = getDB()
  const session = await getSession()

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = (page - 1) * limit

  // Fetch bookings with pagination, ordered by created_at DESC
  const { data: bookings, error, count } = await db
    .from('bookings')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Type assertions
  const typedBookings = (bookings || []) as Booking[]

  if (typedBookings.length === 0) {
    return NextResponse.json({
      bookings: [],
      pagination: { total: 0, page, limit, totalPages: 0 }
    })
  }

  // Get all center IDs from bookings
  const centerIds = [...new Set(typedBookings.map(b => b.center_id).filter(Boolean))] as string[]

  // Fetch centers
  const { data: centers } = centerIds.length > 0
    ? await db.from('centers').select('*').in('id', centerIds)
    : { data: [] }
  const typedCenters = (centers || []) as Center[]
  const centersMap = new Map(typedCenters.map(c => [c.id, c]))

  // Get all booking IDs
  const bookingIds = typedBookings.map(b => b.id)

  // Fetch current user's participation status for all bookings
  let userParticipations: Map<string, string> = new Map()
  if (session?.id) {
    const { data: participations } = await db
      .from('booking_participants')
      .select('booking_id, status')
      .eq('user_id', session.id)
      .in('booking_id', bookingIds)
    const typedUserParticipations = (participations || []) as Participant[]
    userParticipations = new Map(typedUserParticipations.map(p => [p.booking_id, p.status]))
  }

  // Fetch participant counts for each booking
  const { data: allParticipants } = await db
    .from('booking_participants')
    .select('booking_id, status')
    .in('booking_id', bookingIds)

  const typedAllParticipants = (allParticipants || []) as Participant[]
  const participantCounts = new Map<string, { joined: number; pending: number; declined: number }>()
  typedAllParticipants.forEach(p => {
    const counts = participantCounts.get(p.booking_id) || { joined: 0, pending: 0, declined: 0 }
    if (p.status === 'joined') counts.joined++
    else if (p.status === 'declined') counts.declined++
    else counts.pending++
    participantCounts.set(p.booking_id, counts)
  })

  const bookingsWithCenters = typedBookings.map(b => ({
    ...b,
    centers: b.center_id ? centersMap.get(b.center_id) || null : null,
    user_status: userParticipations.get(b.id) || null,
    participant_counts: participantCounts.get(b.id) || { joined: 0, pending: 0, declined: 0 }
  }))

  return NextResponse.json({
    bookings: bookingsWithCenters,
    pagination: {
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    }
  })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Only admins can create bookings
  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
  }

  const { center_id, match_date, start_time, end_time, courts_count, court_price } = await request.json()

  const db = getDB()
  const { data, error } = await db
    .from('bookings')
    .insert({
      center_id: center_id || null,
      match_date,
      start_time,
      end_time,
      courts_count: parseInt(courts_count) || 1,
      court_price: parseFloat(court_price) || 0,
      created_by: session.id || null,
    } as never)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, booking: data })
}
