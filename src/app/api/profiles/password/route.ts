import { getDB } from '@/lib/db'
import { getSession } from '@/lib/auth-session'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { newPassword } = await request.json()

  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Mật khẩu phải có ít nhất 6 ký tự' }, { status: 400 })
  }

  const db = getDB()
  const { error } = await db
    .from('users')
    .update({
      password_hash: newPassword,
    } as never)
    .eq('id', session.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
