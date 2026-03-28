import { getDB } from '@/lib/db'
import { getSession } from '@/lib/auth-session'
import { NextRequest, NextResponse } from 'next/server'

interface User {
  id: string
  username: string
  avatar_url: string | null
}

interface Booking {
  id: string
  [key: string]: unknown
}

interface Match {
  id: string
  booking_id: string | null
  match_type: string
  team1_player1: string | null
  team1_player2: string | null
  team2_player1: string | null
  team2_player2: string | null
  team1_score: number | null
  team2_score: number | null
  winner_team: number | null
  played_at: string
  [key: string]: unknown
}

export async function GET() {
  const db = getDB()

  const { data: matches, error } = await db
    .from('matches')
    .select('*')
    .order('played_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Fetch users and bookings separately for manual join
  const { data: users } = await db.from('users').select('id, username, avatar_url')
  const { data: bookings } = await db.from('bookings').select('*')

  // Type assertions
  const typedUsers = (users || []) as User[]
  const typedBookings = (bookings || []) as Booking[]
  const typedMatches = (matches || []) as Match[]

  const usersMap = new Map(typedUsers.map(u => [u.id, u]))
  const bookingsMap = new Map(typedBookings.map(b => [b.id, b]))

  const matchesWithDetails = typedMatches.map(m => ({
    ...m,
    team1_player1_profile: m.team1_player1 ? usersMap.get(m.team1_player1) || null : null,
    team1_player2_profile: m.team1_player2 ? usersMap.get(m.team1_player2) || null : null,
    team2_player1_profile: m.team2_player1 ? usersMap.get(m.team2_player1) || null : null,
    team2_player2_profile: m.team2_player2 ? usersMap.get(m.team2_player2) || null : null,
    bookings: m.booking_id ? bookingsMap.get(m.booking_id) || null : null
  }))

  return NextResponse.json({ matches: matchesWithDetails })
}

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const {
    match_type,
    booking_id,
    team1_player1,
    team1_player2,
    team2_player1,
    team2_player2,
    team1_score,
    team2_score,
  } = await request.json()

  const t1Score = parseInt(team1_score)
  const t2Score = parseInt(team2_score)
  const winnerTeam = t1Score > t2Score ? 1 : t1Score < t2Score ? 2 : 0

  const db = getDB()
  const { data, error } = await db
    .from('matches')
    .insert({
      match_type,
      booking_id: booking_id || null,
      team1_player1,
      team1_player2: match_type === '2v2' ? team1_player2 : null,
      team2_player1,
      team2_player2: match_type === '2v2' ? team2_player2 : null,
      team1_score: t1Score,
      team2_score: t2Score,
      winner_team: winnerTeam,
    } as never)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // Update rankings
  const isDoubles = match_type === '2v2'
  const allPlayers = [
    { id: team1_player1, won: winnerTeam === 1 },
    { id: team1_player2, won: winnerTeam === 1 },
    { id: team2_player1, won: winnerTeam === 2 },
    { id: team2_player2, won: winnerTeam === 2 },
  ].filter(p => p.id)

  for (const player of allPlayers) {
    await updatePlayerRanking(player.id, player.won, isDoubles)
  }

  return NextResponse.json({ success: true, match: data })
}

async function updatePlayerRanking(userId: string, won: boolean, isDoubles: boolean) {
  const db = getDB()

  const { data: ranking } = await db
    .from('rankings')
    .select('*')
    .eq('user_id', userId)
    .single()

  const ratingField = isDoubles ? 'doubles_rating' : 'singles_rating'
  const winsField = isDoubles ? 'doubles_wins' : 'singles_wins'
  const lossesField = isDoubles ? 'doubles_losses' : 'singles_losses'

  if (ranking) {
    const currentRanking = ranking as Record<string, number>
    const updates: Record<string, number | string> = {
      updated_at: new Date().toISOString(),
    }

    if (won) {
      updates[winsField] = (currentRanking[winsField] || 0) + 1
      updates[ratingField] = Math.min(2000, (currentRanking[ratingField] || 1000) + 25)
    } else {
      updates[lossesField] = (currentRanking[lossesField] || 0) + 1
      updates[ratingField] = Math.max(100, (currentRanking[ratingField] || 1000) - 20)
    }

    await db
      .from('rankings')
      .update(updates as never)
      .eq('user_id', userId)
  } else {
    await db.from('rankings').insert({
      user_id: userId,
      [winsField]: won ? 1 : 0,
      [lossesField]: won ? 0 : 1,
      [ratingField]: won ? 1025 : 980,
    } as never)
  }
}
