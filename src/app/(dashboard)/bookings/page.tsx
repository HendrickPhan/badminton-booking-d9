'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { Plus, Eye, Calendar as CalendarIcon, UserCheck, UserX, Users, ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import { toast } from 'sonner'

interface Center {
  id: string
  name: string
}

interface Booking {
  id: string
  center_id: string | null
  match_date: string
  start_time: string
  end_time: string
  courts_count: number
  court_price: number
  status: string
  centers: Center | null
  user_status: 'joined' | 'declined' | 'pending' | null
  participant_counts: {
    joined: number
    pending: number
    declined: number
  }
}

export default function BookingsPage() {
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 })
  const [isAdmin, setIsAdmin] = useState(false)
  const [formData, setFormData] = useState({
    center_id: '',
    match_date: '',
    start_time: '18:00',
    end_time: '20:00',
    courts_count: '1',
    court_price: '0',
  })

  const fetchBookings = async (page = currentPage) => {
    setLoading(true)
    const response = await fetch(`/api/bookings?page=${page}&limit=10`)
    const data = await response.json()
    setBookings(data.bookings || [])
    setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 })
    setLoading(false)
  }

  const fetchCenters = async () => {
    const response = await fetch('/api/admin/centers')
    const data = await response.json()
    setCenters(data.centers || [])
  }

  useEffect(() => {
    // Check if user is admin
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => {
        if (data.user?.role === 'admin') {
          setIsAdmin(true)
        }
      })

    fetchBookings()
    fetchCenters()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          center_id: formData.center_id || null,
          match_date: formData.match_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          courts_count: parseInt(formData.courts_count),
          court_price: parseFloat(formData.court_price),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error('Tạo đặt sân thất bại: ' + data.error)
      } else {
        toast.success('Đã tạo đặt sân thành công')
        fetchBookings()
        setDialogOpen(false)
        setFormData({
          center_id: '',
          match_date: '',
          start_time: '',
          end_time: '',
          courts_count: '1',
          court_price: '0',
        })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      pending_registration: { label: 'Chờ đăng ký', className: 'bg-blue-500' },
      confirmed: { label: 'Đã chốt', className: 'bg-purple-500' },
      pending_payment: { label: 'Chờ thanh toán', className: 'bg-orange-500' },
      completed: { label: 'Hoàn thành', className: 'bg-green-500' },
      cancelled: { label: 'Đã hủy', className: 'bg-red-500' },
    }
    const config = statusConfig[status] || { label: status, className: '' }
    return <Badge className={config.className}>{config.label}</Badge>
  }

  const handleJoinDecline = async (bookingId: string, status: 'joined' | 'declined') => {
    const response = await fetch(`/api/bookings/${bookingId}/participants`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error('Cập nhật thất bại: ' + data.error)
    } else {
      toast.success(status === 'joined' ? 'Đã tham gia' : 'Đã từ chối')
      fetchBookings()
    }
  }

  const getUserStatusBadge = (userStatus: string | null) => {
    if (!userStatus) return null
    const config: Record<string, { label: string; className: string }> = {
      joined: { label: 'Đã tham gia', className: 'bg-green-500' },
      declined: { label: 'Đã từ chối', className: 'bg-red-500' },
      pending: { label: 'Chờ xác nhận', className: 'bg-yellow-500' },
    }
    const { label, className } = config[userStatus] || { label: userStatus, className: '' }
    return <Badge className={className}>{label}</Badge>
  }

  const handleShare = async (booking: Booking) => {
    const shareUrl = `${window.location.origin}/bookings/${booking.id}`
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 shadow-lg">
            <CalendarIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl">Đặt sân</h1>
            <p className="text-sm text-muted-foreground">Quản lý đặt sân cầu lông</p>
          </div>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Button onClick={() => setDialogOpen(true)} className="btn-gradient">
              <Plus className="mr-2 h-4 w-4" />
              Tạo đặt sân
            </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tạo đặt sân mới</DialogTitle>
              <DialogDescription>
                Lên lịch trận đấu cầu lông mới
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="center">Sân cầu</Label>
                  <Select
                    value={formData.center_id}
                    onValueChange={(value) => value !== null && setFormData({ ...formData, center_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn sân cầu">
                        {formData.center_id ? centers.find(c => c.id === formData.center_id)?.name : 'Chọn sân cầu'}
                      </SelectValue>
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
                  <Label htmlFor="match_date">Ngày đấu</Label>
                  <Input
                    id="match_date"
                    type="date"
                    value={formData.match_date}
                    onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_time">Giờ bắt đầu</Label>
                    <Input
                      id="start_time"
                      type="time"
                      value={formData.start_time}
                      onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end_time">Giờ kết thúc</Label>
                    <Input
                      id="end_time"
                      type="time"
                      value={formData.end_time}
                      onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="courts_count">Số sân</Label>
                    <Input
                      id="courts_count"
                      type="number"
                      min="1"
                      value={formData.courts_count}
                      onChange={(e) => setFormData({ ...formData, courts_count: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="court_price">Giá sân (VNĐ)</Label>
                    <Input
                      id="court_price"
                      type="text"
                      inputMode="numeric"
                      placeholder="VD: 200,000"
                      value={formData.court_price && formData.court_price !== '0' ? new Intl.NumberFormat('vi-VN').format(parseInt(formData.court_price)) : ''}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, '')
                        setFormData({ ...formData, court_price: rawValue })
                      }}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Đang tạo...' : 'Tạo mới'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Danh sách đặt sân</CardTitle>
          <CardDescription>Tất cả các trận đấu đã lên lịch</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4 text-muted-foreground">Đang tải...</p>
          ) : bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Chưa có đặt sân nào</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="flex flex-col gap-3 md:hidden">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="border shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{booking.centers?.name || 'Chưa chọn sân'}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(booking.match_date).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                        {getStatusBadge(booking.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>{`${booking.start_time} - ${booking.end_time}`}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{booking.courts_count} sân</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-green-600 font-medium">{booking.participant_counts?.joined || 0}</span>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-yellow-600">{booking.participant_counts?.pending || 0}</span>
                        {getUserStatusBadge(booking.user_status)}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2 border-t">
                        {booking.status === 'pending_registration' && (
                          <>
                            <Button
                              variant={booking.user_status === 'joined' ? 'default' : 'outline'}
                              size="sm"
                              className="flex-1"
                              onClick={() => handleJoinDecline(booking.id, 'joined')}
                            >
                              <UserCheck className="h-4 w-4 mr-1" />
                              Tham gia
                            </Button>
                            <Button
                              variant={booking.user_status === 'declined' ? 'destructive' : 'outline'}
                              size="sm"
                              className="flex-1"
                              onClick={() => handleJoinDecline(booking.id, 'declined')}
                            >
                              <UserX className="h-4 w-4 mr-1" />
                              Từ chối
                            </Button>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => router.push(`/bookings/${booking.id}`)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Chi tiết
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleShare(booking)}
                        >
                          <Share2 className="h-4 w-4 mr-1" />
                          Chia sẻ
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
                      <TableHead>Ngày</TableHead>
                      <TableHead>Giờ</TableHead>
                      <TableHead>Sân</TableHead>
                      <TableHead>Số sân</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Người tham gia</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>{new Date(booking.match_date).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell>{`${booking.start_time} - ${booking.end_time}`}</TableCell>
                        <TableCell>{booking.centers?.name || '-'}</TableCell>
                        <TableCell>{booking.courts_count}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Users className="h-3 w-3" />
                              <span className="text-green-600 font-medium">{booking.participant_counts?.joined || 0}</span>
                              /
                              <span className="text-yellow-600">{booking.participant_counts?.pending || 0}</span>
                            </div>
                            {getUserStatusBadge(booking.user_status)}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {booking.status === 'pending_registration' && (
                              <>
                                <Button
                                  variant={booking.user_status === 'joined' ? 'default' : 'outline'}
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => handleJoinDecline(booking.id, 'joined')}
                                >
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Tham gia
                                </Button>
                                <Button
                                  variant={booking.user_status === 'declined' ? 'destructive' : 'outline'}
                                  size="sm"
                                  className="h-8 px-2"
                                  onClick={() => handleJoinDecline(booking.id, 'declined')}
                                >
                                  <UserX className="h-3 w-3 mr-1" />
                                  Từ chối
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => router.push(`/bookings/${booking.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleShare(booking)}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4 border-t">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1 || loading}
                onClick={() => {
                  setCurrentPage(currentPage - 1)
                  fetchBookings(currentPage - 1)
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page =>
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - currentPage) <= 1
                  )
                  .map((page, index, arr) => (
                    <span key={page}>
                      {index > 0 && arr[index - 1] !== page - 1 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={page === currentPage ? 'default' : 'outline'}
                        size="sm"
                        className="w-8 h-8 p-0"
                        disabled={loading}
                        onClick={() => {
                          setCurrentPage(page)
                          fetchBookings(page)
                        }}
                      >
                        {page}
                      </Button>
                    </span>
                  ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === pagination.totalPages || loading}
                onClick={() => {
                  setCurrentPage(currentPage + 1)
                  fetchBookings(currentPage + 1)
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}