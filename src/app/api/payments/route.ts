import { getDB } from '@/lib/db'
import { getSession } from '@/lib/auth-session'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '10')
  const offset = (page - 1) * limit

  const db = getDB()
  const isAdmin = session.role === 'admin'

  // Build query with pagination
  let query = db
    .from('payments')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  // Non-admins only see their own payments
  if (!isAdmin) {
    const { data: payments, error, count } = await query.eq('user_id', session.id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return await buildPaymentsResponse(payments || [], db, count || 0, page, limit)
  }

  const { data: payments, error, count } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return await buildPaymentsResponse(payments || [], db, count || 0, page, limit)
}

async function buildPaymentsResponse(
  payments: Array<Record<string, unknown>>,
  db: ReturnType<typeof getDB>,
  total: number,
  page: number,
  limit: number
) {
  if (payments.length === 0) {
    return NextResponse.json({
      payments: [],
      pagination: { total: 0, page, limit, totalPages: 0 }
    })
  }

  // Get unique user IDs and booking IDs
  const userIds = [...new Set(payments.map(p => p.user_id).filter(Boolean))] as string[]
  const bookingIds = [...new Set(payments.map(p => p.booking_id).filter(Boolean))] as string[]

  // Fetch users
  let users: Array<{ id: string; username: string; avatar_url: string | null }> = []
  if (userIds.length > 0) {
    const { data } = await db.from('users').select('id, username, avatar_url').in('id', userIds)
    users = data || []
  }

  // Fetch bookings
  let bookings: Array<Record<string, unknown>> = []
  if (bookingIds.length > 0) {
    const { data } = await db.from('bookings').select('*').in('id', bookingIds)
    bookings = data || []
  }

  // Fetch centers
  const centerIds = [...new Set(bookings.map(b => b.center_id).filter(Boolean))] as string[]
  let centers: Array<{ id: string; name: string; address: string | null }> = []
  if (centerIds.length > 0) {
    const { data } = await db.from('centers').select('id, name, address').in('id', centerIds)
    centers = data || []
  }

  // Create lookup maps
  const usersMap = new Map(users.map(u => [u.id, u]))
  const centersMap = new Map(centers.map(c => [c.id, c]))

  // Build bookings with centers
  const bookingsMap = new Map(
    bookings.map(b => [
      b.id as string,
      {
        ...b,
        centers: b.center_id ? centersMap.get(b.center_id as string) || null : null
      }
    ])
  )

  // Transform payments with user and booking info
  const paymentsWithDetails = payments.map(p => {
    const userInfo = p.user_id ? usersMap.get(p.user_id as string) : null
    const fallbackUser = userInfo ? null : {
      id: p.user_id as string,
      username: 'Unknown User',
      avatar_url: null
    }

    return {
      ...p,
      user: userInfo || fallbackUser,
      users: userInfo || fallbackUser,
      profiles: userInfo || fallbackUser,
      bookings: p.booking_id ? bookingsMap.get(p.booking_id as string) || null : null
    }
  })

  return NextResponse.json({
    payments: paymentsWithDetails,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  })
}

export async function PUT(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { paymentId, paid } = await request.json()

  const db = getDB()

  // Update the payment
  const { error } = await db
    .from('payments')
    .update({
      paid,
      paid_at: paid ? new Date().toISOString() : null,
    } as never)
    .eq('id', paymentId)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // If marking as paid, check if all payments for this booking are now paid
  if (paid) {
    // Get the booking_id for this payment
    const { data: payment } = await db
      .from('payments')
      .select('booking_id')
      .eq('id', paymentId)
      .single()

    if (payment) {
      const bookingId = (payment as { booking_id: string }).booking_id

      // Check if all payments for this booking are paid
      const { data: allPayments } = await db
        .from('payments')
        .select('paid')
        .eq('booking_id', bookingId)

      const typedPayments = (allPayments || []) as Array<{ paid: boolean }>
      const allPaid = typedPayments.every(p => p.paid === true)

      // If all paid, update booking status to completed
      if (allPaid && allPayments && allPayments.length > 0) {
        await db
          .from('bookings')
          .update({ status: 'completed' } as never)
          .eq('id', bookingId)
      }
    }
  }

  return NextResponse.json({ success: true })
}
