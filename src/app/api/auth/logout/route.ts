import { NextRequest, NextResponse } from 'next/server'
import { clearSession } from '@/lib/auth-session'

export async function POST(request: NextRequest) {
  await clearSession()
  const url = new URL('/login', request.url)
  return NextResponse.redirect(url)
}
