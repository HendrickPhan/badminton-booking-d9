'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Lock, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error)
        toast.error(data.error)
      } else {
        toast.success('Chào mừng bạn trở lại!')
        router.push('/')
        router.refresh()
      }
    } catch {
      setError('Lỗi kết nối')
      toast.error('Lỗi kết nối')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex h-screen w-screen items-center justify-center overflow-hidden">
      {/* Background Image */}
      <Image
        src="/clq9.JPG"
        alt="Cầu Lông Q9"
        fill
        className="object-cover"
        priority
      />
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md animate-scale-in">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-xl shadow-orange-500/30">
            <Image
              src="/icon.svg"
              alt="Book Cầu Lông Q9"
              width={48}
              height={48}
              className="h-12 w-12"
            />
          </div>
          <h1 className="text-3xl font-bold text-white">Book Cầu Lông Q9</h1>
          <p className="mt-2 text-white/70">Đăng nhập vào tài khoản của bạn</p>
        </div>

        {/* Form Card */}
        <div className="rounded-3xl bg-white/95 p-6 shadow-2xl sm:p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Tên đăng nhập
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="h-12 rounded-xl border-border/50 bg-background/50 pl-11 transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mật khẩu
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-xl border-border/50 bg-background/50 pl-11 pr-11 transition-all focus:border-primary focus:ring-4 focus:ring-primary/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 p-3 text-center text-sm text-red-500">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="h-12 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-base font-medium text-white shadow-lg shadow-orange-500/30 transition-all hover:from-orange-600 hover:to-amber-600 hover:shadow-xl hover:shadow-orange-500/40"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Đang đăng nhập...
                </div>
              ) : (
                'Đăng nhập'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-white/60">
          Chưa có tài khoản? Liên hệ quản trị viên để tạo tài khoản.
        </p>
      </div>
    </div>
  )
}
