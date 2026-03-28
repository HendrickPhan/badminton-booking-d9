import { getDB } from '@/lib/db'
import { NextResponse } from 'next/server'

interface User {
  id: string
  username: string
  avatar_url: string | null
}

interface Ranking {
  id: string
  user_id: string
  singles_rating: number
  doubles_rating: number
  singles_wins: number
  singles_losses: number
  doubles_wins: number
  doubles_losses: number
  updated_at: string
  [key: string]: unknown
}

export async function GET() {
  const db = getDB()

  const { data: rankings, error } = await db
    .from('rankings')
    .select('*')
    .order('singles_rating', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Fetch users separately for manual join
  const { data: users } = await db.from('users').select('id, username, avatar_url')

  // Type assertions
  const typedUsers = (users || []) as User[]
  const typedRankings = (rankings || []) as Ranking[]

  const usersMap = new Map(typedUsers.map(u => [u.id, u]))

  // Transform to match expected format
  const rankingsWithUsers = typedRankings.map(r => ({
    ...r,
    users: r.user_id ? usersMap.get(r.user_id) || null : null,
    profiles: r.user_id ? usersMap.get(r.user_id) || null : null
  }))

  return NextResponse.json({ rankings: rankingsWithUsers })
}
