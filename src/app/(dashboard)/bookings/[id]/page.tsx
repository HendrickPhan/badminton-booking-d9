'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { ArrowLeft, Check, X, Plus, CreditCard, Calendar as CalendarIcon, MapPin, Users, Trash2, Pencil, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import { useConfirmDialog } from '@/components/confirm-dialog'

interface BookingDetail {
  id: string
  center_id: string | null
  match_date: string
  start_time: string
  end_time: string
  courts_count: number
  court_price: number
  status: 'pending_registration' | 'confirmed' | 'pending_payment' | 'completed' | 'cancelled'
  centers: { name: string; address: string | null; latitude: number | null; longitude: number | null } | null
  booking_participants: Array<{
    id: string
    user_id: string
    status: string
    user: { id: string; username: string; avatar_url: string | null } | null
  }>
  booking_consumables: Array<{
    id: string
    item_type: string
    quantity: number
    unit_price: number
  }>
  payments: Array<{
    id: string
    user_id: string
    amount: number
    paid: boolean
    user: { id: string; username: string; avatar_url: string | null } | null
  }>
}

interface SessionUser {
  id: string
  username: string
  role: 'user' | 'admin'
}

interface User {
  id: string
  username: string
}

interface Center {
  id: string
  name: string
}

export default function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null)
  const [consumableDialog, setConsumableDialog] = useState(false)
  const [addUserDialog, setAddUserDialog] = useState(false)
  const [statusDialog, setStatusDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [consumableForm, setConsumableForm] = useState({
    item_type: 'shuttlecock' as 'shuttlecock' | 'drink',
    quantity: '1',
    unit_price: '0',
  })
  const [editForm, setEditForm] = useState({
    center_id: '',
    match_date: '',
    start_time: '',
    end_time: '',
    courts_count: '',
    court_price: '',
  })
  const { confirm, dialog } = useConfirmDialog()

  const fetchBooking = async () => {
    setLoading(true)

    // Get current user
    const meResponse = await fetch('/api/auth/me')
    const meData = await meResponse.json()
    if (meData.user) {
      setCurrentUser(meData.user)
    }

    const response = await fetch(`/api/bookings/${id}`)
    const data = await response.json()
    setBooking(data.booking || null)
    setLoading(false)
  }

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users')
    const data = await response.json()
    setUsers(data.users || [])
  }

  useEffect(() => {
    fetchBooking()
  }, [id])

  const handleVote = async (status: 'joined' | 'declined') => {
    const response = await fetch(`/api/bookings/${id}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error('Cập nhật thất bại: ' + data.error)
      return
    }

    toast.success(status === 'joined' ? 'Bạn đã tham gia trận đấu!' : 'Bạn đã từ chối trận đấu')
    fetchBooking()
  }

  const handleAddConsumable = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await fetch(`/api/bookings/${id}/consumables`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(consumableForm),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error('Thêm thất bại: ' + data.error)
    } else {
      toast.success('Đã thêm vật phẩm tiêu hao')
      setConsumableDialog(false)
      setConsumableForm({ item_type: 'shuttlecock', quantity: '1', unit_price: '0' })
      fetchBooking()
    }
  }

  const handlePayment = async (paymentId: string, paid: boolean) => {
    const response = await fetch('/api/payments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, paid }),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error('Cập nhật thanh toán thất bại: ' + data.error)
    } else {
      toast.success(paid ? 'Đã đánh dấu đã thanh toán' : 'Đã đánh dấu chưa thanh toán')
      fetchBooking()
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    const response = await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error('Cập nhật trạng thái thất bại: ' + data.error)
    } else {
      toast.success('Đã cập nhật trạng thái')
      setStatusDialog(false)
      fetchBooking()
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedUserId) return

    const response = await fetch(`/api/bookings/${id}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: selectedUserId, status: 'joined' }),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error('Thêm người dùng thất bại: ' + data.error)
    } else {
      toast.success('Đã thêm người dùng')
      setAddUserDialog(false)
      setSelectedUserId('')
      fetchBooking()
    }
  }

  const handleRemoveUser = async (participantId: string) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa',
      description: 'Bạn có chắc muốn xóa người dùng này khỏi trận đấu?',
      confirmText: 'Xóa',
      destructive: true,
    })
    if (!confirmed) return

    const response = await fetch(`/api/bookings/${id}/participants/${participantId}`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error('Xóa thất bại: ' + data.error)
    } else {
      toast.success('Đã xóa người dùng')
      fetchBooking()
    }
  }

  const handleEditBooking = async (e: React.FormEvent) => {
    e.preventDefault()

    const response = await fetch(`/api/bookings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        center_id: editForm.center_id || null,
        match_date: editForm.match_date,
        start_time: editForm.start_time,
        end_time: editForm.end_time,
        courts_count: parseInt(editForm.courts_count) || 1,
        court_price: parseFloat(editForm.court_price) || 0,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error('Cập nhật thất bại: ' + data.error)
    } else {
      toast.success('Đã cập nhật thông tin đặt sân')
      setEditDialog(false)
      fetchBooking()
    }
  }

  const openEditDialog = async () => {
    // Fetch centers
    const response = await fetch('/api/admin/centers')
    const data = await response.json()
    setCenters(data.centers || [])

    // Set form values from current booking
    if (booking) {
      setEditForm({
        center_id: booking.center_id || '',
        match_date: booking.match_date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        courts_count: booking.courts_count.toString(),
        court_price: booking.court_price.toString(),
      })
    }
    setEditDialog(true)
  }

  const calculateTotalCost = () => {
    if (!booking) return 0
    const courtCost = booking.court_price
    const consumablesCost = booking.booking_consumables.reduce(
      (sum, c) => sum + c.quantity * c.unit_price,
      0
    )
    return courtCost + consumablesCost
  }

  const getParticipantCount = () => {
    if (!booking) return 0
    return booking.booking_participants.filter((p) => p.status === 'joined').length
  }

  const getCostPerPerson = () => {
    const total = calculateTotalCost()
    const count = getParticipantCount()
    return count > 0 ? total / count : 0
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { label: string; className: string }> = {
      pending_registration: { label: 'Chờ đăng ký', className: 'bg-blue-500' },
      confirmed: { label: 'Đã chốt', className: 'bg-purple-500' },
      pending_payment: { label: 'Chờ thanh toán', className: 'bg-orange-500' },
      completed: { label: 'Hoàn thành', className: 'bg-green-500' },
      cancelled: { label: 'Đã hủy', className: 'bg-red-500' },
    }
    const { label, className } = config[status] || { label: status, className: '' }
    return <Badge className={className}>{label}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  const handleShare = async () => {
    if (!booking) return

    const shareUrl = window.location.href
    const shareTitle = `Đặt sân cầu lông - ${booking.centers?.name || 'Chưa chọn sân'}`
    const shareText = `Tham gia trận đấu cầu lông vào ${new Date(booking.match_date).toLocaleDateString('vi-VN')} lúc ${booking.start_time} - ${booking.end_time} tại ${booking.centers?.name || 'địa điểm'}!`

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        })
      } catch {
        // User cancelled or share failed
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        toast.success('Đã sao chép liên kết')
      } catch {
        toast.error('Không thể sao chép liên kết')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
        <p className="mt-4 text-muted-foreground">Không tìm thấy đặt sân</p>
      </div>
    )
  }

  const currentUserParticipation = booking.booking_participants.find(
    (p) => p.user_id === currentUser?.id
  )
  const isAdmin = currentUser?.role === 'admin'
  const canVote = booking.status === 'pending_registration'
  const canMarkPaid = booking.status === 'pending_payment'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/bookings')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold lg:text-3xl">Chi tiết đặt sân</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(booking.match_date).toLocaleDateString('vi-VN')} | {booking.start_time} - {booking.end_time}
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={handleShare}>
          <Share2 className="h-4 w-4 mr-2" />
          Chia sẻ
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Thông tin trận đấu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sân cầu</span>
              <span className="font-medium">{booking.centers?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ngày</span>
              <span>{new Date(booking.match_date).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giờ</span>
              <span>{`${booking.start_time} - ${booking.end_time}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Số sân</span>
              <span>{booking.courts_count}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Giá sân</span>
              <span>{formatCurrency(booking.court_price)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Trạng thái</span>
              <div className="flex items-center gap-2">
                {getStatusBadge(booking.status)}
                {isAdmin && (
                  <Button variant="ghost" size="sm" onClick={() => setStatusDialog(true)}>
                    Đổi
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
          {isAdmin && (
            <div className="px-6 pb-4">
              <Button variant="outline" size="sm" onClick={openEditDialog}>
                <Pencil className="mr-2 h-4 w-4" />
                Chỉnh sửa thông tin
              </Button>
            </div>
          )}
          {booking.centers?.latitude && booking.centers?.longitude && (
            <div className="px-6 pb-4">
              <div className="rounded-lg overflow-hidden border">
                <iframe
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${booking.centers.latitude},${booking.centers.longitude}&zoom=16`}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                  title={`Vị trí ${booking.centers.name}`}
                />
              </div>
              {booking.centers.address && (
                <p className="text-sm text-muted-foreground mt-2">{booking.centers.address}</p>
              )}
            </div>
          )}
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Tổng chi phí
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tiền sân</span>
              <span>{formatCurrency(booking.court_price)}</span>
            </div>
            {booking.booking_consumables.map((c) => (
              <div key={c.id} className="flex justify-between">
                <span className="text-muted-foreground">
                  {c.item_type === 'shuttlecock' ? 'Cầu' : 'Nước'} (x{c.quantity})
                </span>
                <span>{formatCurrency(c.quantity * c.unit_price)}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold text-lg">
              <span>Tổng cộng</span>
              <span className="text-green-600">{formatCurrency(calculateTotalCost())}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Mỗi người ({getParticipantCount()} người)</span>
              <span className="font-medium">{formatCurrency(getCostPerPerson())}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap gap-4">
        {canVote && currentUser && (
          <>
            <Button
              onClick={() => handleVote('joined')}
              variant={currentUserParticipation?.status === 'joined' ? 'default' : 'outline'}
              className={currentUserParticipation?.status === 'joined' ? 'btn-gradient' : ''}
            >
              <Check className="mr-2 h-4 w-4" />
              Tham gia
            </Button>
            <Button
              onClick={() => handleVote('declined')}
              variant={currentUserParticipation?.status === 'declined' ? 'destructive' : 'outline'}
            >
              <X className="mr-2 h-4 w-4" />
              Từ chối
            </Button>
          </>
        )}
        {isAdmin && (
          <>
            <Button variant="outline" onClick={() => { setAddUserDialog(true); fetchUsers() }}>
              <Users className="mr-2 h-4 w-4" />
              Thêm người chơi
            </Button>
            <Button variant="outline" onClick={() => setConsumableDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm vật phẩm tiêu hao
            </Button>
          </>
        )}
      </div>

      <Tabs defaultValue="participants">
        <TabsList>
          <TabsTrigger value="participants">Người tham gia</TabsTrigger>
          <TabsTrigger value="payments">Thanh toán</TabsTrigger>
        </TabsList>
        <TabsContent value="participants">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Người tham gia</CardTitle>
              <CardDescription>Danh sách người đã tham gia hoặc từ chối trận đấu</CardDescription>
            </CardHeader>
            <CardContent>
              {booking.booking_participants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground">Chưa có ai tham gia</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="flex flex-col gap-3 md:hidden">
                    {booking.booking_participants.map((p) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={p.user?.avatar_url || undefined} />
                            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm">
                              {p.user?.username?.charAt(0).toUpperCase() || '?'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{p.user?.username || 'Người dùng không xác định'}</p>
                            <Badge
                              className={
                                p.status === 'joined'
                                  ? 'bg-green-500 text-xs'
                                  : p.status === 'declined'
                                  ? 'bg-red-500 text-xs'
                                  : 'bg-gray-500 text-xs'
                              }
                            >
                              {p.status === 'joined' ? 'Đã tham gia' : p.status === 'declined' ? 'Đã từ chối' : 'Chờ phản hồi'}
                            </Badge>
                          </div>
                        </div>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveUser(p.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Người dùng</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          {isAdmin && <TableHead className="text-right">Thao tác</TableHead>}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {booking.booking_participants.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={p.user?.avatar_url || undefined} />
                                  <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                    {p.user?.username?.charAt(0).toUpperCase() || '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{p.user?.username || 'Người dùng không xác định'}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  p.status === 'joined'
                                    ? 'bg-green-500'
                                    : p.status === 'declined'
                                    ? 'bg-red-500'
                                    : 'bg-gray-500'
                                }
                              >
                                {p.status === 'joined' ? 'Đã tham gia' : p.status === 'declined' ? 'Đã từ chối' : 'Chờ phản hồi'}
                              </Badge>
                            </TableCell>
                            {isAdmin && (
                              <TableCell className="text-right">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleRemoveUser(p.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="payments">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Thanh toán</CardTitle>
              <CardDescription>Theo dõi trạng thái thanh toán của người tham gia</CardDescription>
            </CardHeader>
            <CardContent>
              {booking.payments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">Chưa có thanh toán nào</p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="flex flex-col gap-3 md:hidden">
                    {booking.payments.map((p) => {
                      const isOwnPayment = p.user_id === currentUser?.id
                      const canTogglePayment = isAdmin || (canMarkPaid && isOwnPayment)

                      return (
                        <div key={p.id} className="p-3 rounded-lg border bg-muted/30 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={p.user?.avatar_url || undefined} />
                                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white text-sm">
                                  {p.user?.username?.charAt(0).toUpperCase() || '?'}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-sm">{p.user?.username || 'Không xác định'}</span>
                            </div>
                            <span className="font-bold">{formatCurrency(p.amount)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <Badge className={p.paid ? 'bg-green-500' : 'bg-orange-500'}>
                              {p.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                            </Badge>
                            {canTogglePayment && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePayment(p.id, !p.paid)}
                              >
                                {p.paid ? 'Hủy' : 'Xác nhận'}
                              </Button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Người dùng</TableHead>
                          <TableHead>Số tiền</TableHead>
                          <TableHead>Trạng thái</TableHead>
                          <TableHead className="text-right">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {booking.payments.map((p) => {
                          const isOwnPayment = p.user_id === currentUser?.id
                          const canTogglePayment = isAdmin || (canMarkPaid && isOwnPayment)

                          return (
                            <TableRow key={p.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <Avatar>
                                    <AvatarImage src={p.user?.avatar_url || undefined} />
                                    <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                                      {p.user?.username?.charAt(0).toUpperCase() || '?'}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{p.user?.username || 'Người dùng không xác định'}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{formatCurrency(p.amount)}</TableCell>
                              <TableCell>
                                <Badge className={p.paid ? 'bg-green-500' : 'bg-orange-500'}>
                                  {p.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {canTogglePayment && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handlePayment(p.id, !p.paid)}
                                  >
                                    <CreditCard className="mr-2 h-4 w-4" />
                                    {p.paid ? 'Chưa thanh toán' : 'Đã thanh toán'}
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Dialog */}
      <Dialog open={addUserDialog} onOpenChange={setAddUserDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm người chơi</DialogTitle>
            <DialogDescription>Thêm người chơi vào trận đấu này</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddUser}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="user">Người dùng</Label>
                <Select value={selectedUserId} onValueChange={(v) => v && setSelectedUserId(v)}>
                  <SelectTrigger>
                    <span>{users.find(u => u.id === selectedUserId)?.username || 'Chọn người dùng'}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddUserDialog(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={!selectedUserId}>Thêm</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi trạng thái</DialogTitle>
            <DialogDescription>Chọn trạng thái mới cho đặt sân này</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            {[
              { value: 'pending_registration', label: 'Chờ đăng ký' },
              { value: 'confirmed', label: 'Đã chốt' },
              { value: 'pending_payment', label: 'Chờ thanh toán' },
              { value: 'completed', label: 'Hoàn thành' },
              { value: 'cancelled', label: 'Đã hủy' },
            ].map((status) => (
              <Button
                key={status.value}
                variant={booking.status === status.value ? 'default' : 'outline'}
                className="w-full justify-start"
                onClick={() => handleStatusChange(status.value)}
              >
                {status.label}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Consumable Dialog */}
      <Dialog open={consumableDialog} onOpenChange={setConsumableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm vật phẩm tiêu hao</DialogTitle>
            <DialogDescription>Thêm cầu hoặc nước uống vào đặt sân này</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddConsumable}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="item_type">Loại</Label>
                <select
                  id="item_type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={consumableForm.item_type}
                  onChange={(e) =>
                    setConsumableForm({
                      ...consumableForm,
                      item_type: e.target.value as 'shuttlecock' | 'drink',
                    })
                  }
                >
                  <option value="shuttlecock">Cầu</option>
                  <option value="drink">Nước uống</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Số lượng</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={consumableForm.quantity}
                  onChange={(e) => setConsumableForm({ ...consumableForm, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit_price">Đơn giá (VNĐ)</Label>
                <Input
                  id="unit_price"
                  type="number"
                  min="0"
                  value={consumableForm.unit_price}
                  onChange={(e) => setConsumableForm({ ...consumableForm, unit_price: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setConsumableDialog(false)}>
                Hủy
              </Button>
              <Button type="submit">Thêm</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin đặt sân</DialogTitle>
            <DialogDescription>Cập nhật thông tin chi tiết của buổi đặt sân</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditBooking}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="center_id">Sân cầu</Label>
                <Select value={editForm.center_id || ''} onValueChange={(v) => v && setEditForm({ ...editForm, center_id: v })}>
                  <SelectTrigger>
                    <span>{centers.find(c => c.id === editForm.center_id)?.name || 'Chọn sân cầu'}</span>
                  </SelectTrigger>
                  <SelectContent>
                    {centers.map((center) => (
                      <SelectItem key={center.id} value={center.id}>
                        {center.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="match_date">Ngày</Label>
                <Input
                  id="match_date"
                  type="date"
                  value={editForm.match_date}
                  onChange={(e) => setEditForm({ ...editForm, match_date: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_time">Giờ bắt đầu</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={editForm.start_time}
                    onChange={(e) => setEditForm({ ...editForm, start_time: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">Giờ kết thúc</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={editForm.end_time}
                    onChange={(e) => setEditForm({ ...editForm, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="courts_count">Số sân</Label>
                <Input
                  id="courts_count"
                  type="number"
                  min="1"
                  value={editForm.courts_count}
                  onChange={(e) => setEditForm({ ...editForm, courts_count: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="court_price">Giá sân (VNĐ)</Label>
                <Input
                  id="court_price"
                  type="text"
                  inputMode="numeric"
                  placeholder="VD: 200,000"
                  value={editForm.court_price ? new Intl.NumberFormat('vi-VN').format(parseInt(editForm.court_price)) : ''}
                  onChange={(e) => {
                    const rawValue = e.target.value.replace(/\D/g, '')
                    setEditForm({ ...editForm, court_price: rawValue })
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialog(false)}>
                Hủy
              </Button>
              <Button type="submit">Cập nhật</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {dialog}
    </div>
  )
}
