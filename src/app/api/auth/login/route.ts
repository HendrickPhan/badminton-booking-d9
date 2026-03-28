import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser, createSession } from '@/lib/auth-session'

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: 'Thiếu tên đăng nhập hoặc mật khẩu' }, { status: 400 })
    }

    const user = await authenticateUser(username, password)

    if (!user) {
      return NextResponse.json({ error: 'Sai tên đăng nhập hoặc mật khẩu' }, { status: 401 })
    }

    await createSession(user)

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Lỗi đăng nhập' }, { status: 500 })
  }
}
