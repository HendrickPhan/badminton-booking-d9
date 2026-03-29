'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { User, Shield, Calendar, Users } from 'lucide-react'

interface UserData {
  id: string
  username: string
  phone_number: string | null
  avatar_url: string | null
  gender: 'male' | 'female' | 'other' | null
  role: 'user' | 'admin'
  created_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [username, setUsername] = useState('')
  const [gender, setGender] = useState<string>('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setUsername(data.user.username || '')
        setAvatarUrl(data.user.avatar_url || '')
        setGender(data.user.gender || '')
      } else {
        router.push('/login')
      }
    } catch {
      router.push('/login')
    }
    setLoading(false)
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const response = await fetch('/api/profiles', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, avatar_url: avatarUrl, gender: gender || null }),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error('Cập nhật thất bại: ' + data.error)
    } else {
      toast.success('Đã cập nhật thông tin')
      fetchProfile()
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error('Mật khẩu mới không khớp')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự')
      return
    }

    const response = await fetch('/api/profiles/password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword }),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error('Đổi mật khẩu thất bại: ' + data.error)
    } else {
      toast.success('Đã đổi mật khẩu thành công')
      setNewPassword('')
      setConfirmPassword('')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-gray-500 shadow-lg">
          <User className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Tài khoản</h1>
          <p className="text-sm text-muted-foreground">Quản lý cài đặt tài khoản</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Thông tin cá nhân</CardTitle>
          <CardDescription>Cập nhật thông tin cá nhân của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
              <Avatar className="h-20 w-20 shrink-0">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-2xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  {username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2 w-full">
                <Label htmlFor="avatar_url">URL ảnh đại diện</Label>
                <Input
                  id="avatar_url"
                  type="url"
                  placeholder="https://example.com/avatar.png"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Tên người dùng</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Giới tính</Label>
              <Select value={gender} onValueChange={(v) => v !== null && setGender(v)}>
                <SelectTrigger>
                  <span>
                    {gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : gender === 'other' ? 'Khác' : 'Chọn giới tính'}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Không chọn</SelectItem>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="btn-gradient">Lưu thay đổi</Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Đổi mật khẩu</CardTitle>
          <CardDescription>Cập nhật mật khẩu của bạn</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">Mật khẩu mới</Label>
              <Input
                id="new_password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Xác nhận mật khẩu mới</Label>
              <Input
                id="confirm_password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit">Đổi mật khẩu</Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Thông tin tài khoản</CardTitle>
          <CardDescription>Chi tiết tài khoản của bạn</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Vai trò</span>
            </div>
            <Badge className={user?.role === 'admin' ? 'bg-gradient-to-r from-violet-500 to-purple-500' : ''}>
              {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
            </Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Giới tính</span>
            </div>
            <span className="font-medium">
              {user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : user?.gender === 'other' ? 'Khác' : '-'}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Ngày tham gia</span>
            </div>
            <span className="font-medium">{new Date(user?.created_at || '').toLocaleDateString('vi-VN')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
