'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Plus, Pencil, Trash2, Users as UsersIcon } from 'lucide-react'
import { User } from '@/types/database'
import { toast } from 'sonner'
import { useConfirmDialog } from '@/components/confirm-dialog'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    gender: 'male' as '' | 'male' | 'female' | 'other',
    role: 'user' as 'user' | 'admin',
  })
  const { confirm, dialog } = useConfirmDialog()

  const fetchUsers = async () => {
    setLoading(true)
    const response = await fetch('/api/admin/users')
    const data = await response.json()
    if (response.ok) {
      setUsers(data.users || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const resetForm = () => {
    setFormData({ email: '', password: '', username: '', gender: 'male', role: 'user' })
    setEditingUser(null)
  }

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        email: user.email || '',
        password: '',
        username: user.username,
        gender: (user.gender as '' | 'male' | 'female' | 'other') || '',
        role: user.role
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingUser) {
      // Update user
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: editingUser.id,
          username: formData.username,
          email: formData.email,
          gender: formData.gender,
          role: formData.role,
          password: formData.password || undefined,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error('Cập nhật thất bại: ' + result.error)
      } else {
        toast.success('Đã cập nhật người dùng')
        fetchUsers()
        setDialogOpen(false)
        resetForm()
      }
    } else {
      // Create new user
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) {
        toast.error('Tạo người dùng thất bại: ' + result.error)
      } else {
        toast.success('Đã tạo người dùng mới')
        fetchUsers()
        setDialogOpen(false)
        resetForm()
      }
    }
  }

  const handleDelete = async (userId: string) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa',
      description: 'Bạn có chắc muốn xóa người dùng này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      destructive: true,
    })
    if (!confirmed) return

    const response = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    })

    const result = await response.json()

    if (!response.ok) {
      toast.error('Xóa thất bại: ' + result.error)
    } else {
      toast.success('Đã xóa người dùng')
      fetchUsers()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
            <UsersIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl">Người dùng</h1>
            <p className="text-sm text-muted-foreground">Quản lý tài khoản người dùng</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button onClick={() => handleOpenDialog()} className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" />
            Thêm người dùng
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Cập nhật thông tin người dùng' : 'Tạo tài khoản người dùng mới'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                {!editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </div>
                )}
                {editingUser && (
                  <div className="space-y-2">
                    <Label htmlFor="password">Mật khẩu mới (để trống nếu không đổi)</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="username">Tên người dùng</Label>
                  <Input
                    id="username"
                    placeholder="Nhập tên người dùng"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Vai trò</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => value && setFormData({ ...formData, role: value as 'user' | 'admin' })}
                  >
                    <SelectTrigger>
                      <span>{formData.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">Người dùng</SelectItem>
                      <SelectItem value="admin">Quản trị viên</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Giới tính</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' | 'other' | '' })}
                  >
                    <SelectTrigger>
                      <span>
                        {formData.gender === 'male' ? 'Nam' : formData.gender === 'female' ? 'Nữ' : formData.gender === 'other' ? 'Khác' : 'Chọn giới tính'}
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
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">{editingUser ? 'Cập nhật' : 'Tạo mới'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Danh sách người dùng</CardTitle>
          <CardDescription>Tất cả người dùng đã đăng ký</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4 text-muted-foreground">Đang tải...</p>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <UsersIcon className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Chưa có người dùng nào</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="flex flex-col gap-3 md:hidden">
                {users.map((user) => (
                  <Card key={user.id} className="border shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                              {user.username.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            {user.email && (
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            )}
                          </div>
                        </div>
                        <Badge className={user.role === 'admin' ? 'bg-gradient-to-r from-violet-500 to-purple-500' : ''}>
                          {user.role === 'admin' ? 'Quản trị' : 'Người dùng'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Giới tính:</span>
                          {user.gender === 'male' ? (
                            <Badge className="bg-blue-500 text-xs">Nam</Badge>
                          ) : user.gender === 'female' ? (
                            <Badge className="bg-pink-500 text-xs">Nữ</Badge>
                          ) : user.gender === 'other' ? (
                            <Badge className="bg-gray-500 text-xs">Khác</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                        <span className="text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleOpenDialog(user)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Người dùng</TableHead>
                      <TableHead>Giới tính</TableHead>
                      <TableHead>Vai trò</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar_url || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                {user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <span className="font-medium">{user.username}</span>
                              {user.email && (
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.gender === 'male' ? (
                            <Badge className="bg-blue-500">Nam</Badge>
                          ) : user.gender === 'female' ? (
                            <Badge className="bg-pink-500">Nữ</Badge>
                          ) : user.gender === 'other' ? (
                            <Badge className="bg-gray-500">Khác</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={user.role === 'admin' ? 'bg-gradient-to-r from-violet-500 to-purple-500' : ''}>
                            {user.role === 'admin' ? 'Quản trị' : 'Người dùng'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(user.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {dialog}
    </div>
  )
}
