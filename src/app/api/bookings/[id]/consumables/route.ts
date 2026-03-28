import { getDB } from '@/lib/db'
import { getSession } from '@/lib/auth-session'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id: bookingId } = await params
  const { item_type, quantity, unit_price } = await request.json()

  const db = getDB()
  const { data, error } = await db
    .from('booking_consumables')
    .insert({
      booking_id: bookingId,
      item_type,
      quantity: parseInt(quantity),
      unit_price: parseFloat(unit_price),
    } as never)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true, consumable: data })
}
