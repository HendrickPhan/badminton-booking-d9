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
  [key: string]: unknown
}

interface Center {
  id: string
  name: string
  address: string | null
  [key: string]: unknown
}

interface User {
  id: string
  username: string
  avatar_url: string | null
}

interface Participant {
  id: string
  booking_id: string
  user_id: string
  status: string
  [key: string]: unknown
}

interface Consumable {
  id: string
  booking_id: string
  item_type: string
  quantity: number
  unit_price: number
  [key: string]: unknown
}

interface Payment {
  id: string
  booking_id: string
  user_id: string
  amount: number
  paid: boolean
  [key: string]: unknown
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const db = getDB()
  const session = await getSession()

  // Fetch booking
  const { data: booking, error } = await db
    .from('bookings')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  const typedBooking = booking as Booking

  // Fetch related data separately
  const { data: centers } = await db.from('centers').select('*')
  const { data: users } = await db.from('users').select('id, username, avatar_url')
  const { data: participants } = await db.from('booking_participants').select('*').eq('booking_id', id)
  const { data: consumables } = await db.from('booking_consumables').select('*').eq('booking_id', id)
  const { data: payments } = await db.from('payments').select('*').eq('booking_id', id)

  // Type assertions
  const typedCenters = (centers || []) as Center[]
  const typedUsers = (users || []) as User[]
  const typedParticipants = (participants || []) as Participant[]
  const typedConsumables = (consumables || []) as Consumable[]
  const typedPayments = (payments || []) as Payment[]

  // Create lookup maps
  const centersMap = new Map(typedCenters.map(c => [c.id, c]))
  const usersMap = new Map(typedUsers.map(u => [u.id, u]))

  // Add current session user to map if not already there (for stale sessions)
  if (session && !usersMap.has(session.id)) {
    usersMap.set(session.id, {
      id: session.id,
      username: session.username,
      avatar_url: null
    })
  }

  // Build the response with manual joins
  const bookingWithDetails = {
    ...typedBooking,
    centers: typedBooking.center_id ? centersMap.get(typedBooking.center_id) || null : null,
    booking_participants: typedParticipants.map(p => ({
      ...p,
      user: p.user_id ? usersMap.get(p.user_id) || { id: p.user_id, username: 'Unknown User', avatar_url: null } : null
    })),
    booking_consumables: typedConsumables,
    payments: typedPayments.map(p => ({
      ...p,
      user: p.user_id ? usersMap.get(p.user_id) || { id: p.user_id, username: 'Unknown User', avatar_url: null } : null
    }))
  }

  return NextResponse.json({ booking: bookingWithDetails })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
  }

  const body = await request.json()
  const { status, center_id, match_date, start_time, end_time, courts_count, court_price } = body

  const db = getDB()

  // If only updating status
  if (status && Object.keys(body).length === 1) {
    const validStatuses = ['pending_registration', 'confirmed', 'pending_payment', 'completed', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // If changing to pending_payment, create payment records for joined participants
    if (status === 'pending_payment') {
      // Get the booking to calculate costs
      const { data: booking } = await db
        .from('bookings')
        .select('*')
        .eq('id', id)
        .single()

      if (!booking) {
        return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      }

      const typedBooking = booking as Booking

      // Get joined participants
      const { data: participants } = await db
        .from('booking_participants')
        .select('*')
        .eq('booking_id', id)
        .eq('status', 'joined')

      // Get consumables
      const { data: consumables } = await db
        .from('booking_consumables')
        .select('*')
        .eq('booking_id', id)

      const typedConsumables = (consumables || []) as Consumable[]

      // Calculate total cost
      const courtCost = typedBooking.court_price || 0
      const consumablesCost = typedConsumables.reduce(
        (sum, c) => sum + c.quantity * c.unit_price,
        0
      )
      const totalCost = courtCost + consumablesCost

      // Calculate cost per person
      const typedParticipants = (participants || []) as Participant[]
      const joinedCount = typedParticipants.length
      const costPerPerson = joinedCount > 0 ? Math.ceil(totalCost / joinedCount) : 0

      // Create payment records for each joined participant
      if (typedParticipants.length > 0) {
        const paymentRecords = typedParticipants.map(p => ({
          booking_id: id,
          user_id: p.user_id,
          amount: costPerPerson,
          paid: false,
        }))

        // Delete existing payments first (in case of re-generation)
        await db.from('payments').delete().eq('booking_id', id)

        // Insert new payments
        const { error: paymentError } = await db
          .from('payments')
          .insert(paymentRecords as never)

        if (paymentError) {
          console.error('Error creating payments:', paymentError)
          return NextResponse.json({ error: 'Failed to create payment records' }, { status: 500 })
        }
      }
    }

    // Update booking status
    const { error } = await db
      .from('bookings')
      .update({ status } as never)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  }

  // If updating other fields
  const updateData: Record<string, unknown> = {}
  if (center_id !== undefined) updateData.center_id = center_id || null
  if (match_date !== undefined) updateData.match_date = match_date
  if (start_time !== undefined) updateData.start_time = start_time
  if (end_time !== undefined) updateData.end_time = end_time
  if (courts_count !== undefined) updateData.courts_count = parseInt(courts_count) || 1
  if (court_price !== undefined) updateData.court_price = parseFloat(court_price) || 0
  if (status !== undefined) updateData.status = status

  const { error } = await db
    .from('bookings')
    .update(updateData as never)
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
