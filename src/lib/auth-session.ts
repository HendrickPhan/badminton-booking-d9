import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { getDB } from './db'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
)

export interface SessionUser {
  id: string
  username: string
  role: 'user' | 'admin'
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY)

  const cookieStore = await cookies()
  cookieStore.set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function getSession(): Promise<(SessionUser & { role: string }) | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload.user as SessionUser & { role: string }
  } catch {
    return null
  }
}

export async function clearSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export async function authenticateUser(username: string, password: string): Promise<SessionUser | null> {
  const db = getDB()

  const { data: user, error } = await db
    .from('users')
    .select('id, username, role, password_hash')
    .eq('username', username)
    .single()

  if (error || !user) return null

  // Simple password check
  const userData = user as unknown as { id: string; username: string; role: string; password_hash: string }
  const passwordMatch = userData.password_hash === password

  if (!passwordMatch) return null

  return {
    id: userData.id,
    username: userData.username,
    role: userData.role as 'user' | 'admin',
  }
}

export async function getUserById(id: string) {
  const db = getDB()

  const { data: user } = await db
    .from('users')
    .select('id, username, phone_number, avatar_url, role, created_at')
    .eq('id', id)
    .single()

  return user
}
