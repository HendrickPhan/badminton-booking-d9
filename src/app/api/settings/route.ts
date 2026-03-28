import { getDB } from '@/lib/db'
import { NextResponse } from 'next/server'

interface Settings {
  female_discount_percent: number
  female_discount_enabled: boolean
}

// Get public settings (for discount display)
export async function GET() {
  const db = getDB()
  const { data, error } = await db
    .from('settings')
    .select('female_discount_percent, female_discount_enabled')
    .eq('id', 1)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  const typedData = data as Settings | null

  return NextResponse.json({
    settings: {
      female_discount_percent: typedData?.female_discount_percent || 0,
      female_discount_enabled: typedData?.female_discount_enabled || false
    }
  })
}
