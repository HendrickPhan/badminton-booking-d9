'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CreditCard, Eye, Calendar, MapPin, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { useConfirmDialog } from '@/components/confirm-dialog'

interface Payment {
  id: string
  booking_id: string
  user_id: string
  amount: number
  paid: boolean
  paid_at: string | null
  created_at: string
  users: { username: string; avatar_url: string | null } | null
  profiles: { username: string; avatar_url: string | null } | null
  bookings: {
    match_date: string
    start_time: string
    end_time: string
    centers: { name: string } | null
  } | null
}

export default function PaymentsPage() {
  const router = useRouter()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, totalPages: 0 })
  const { confirm, dialog } = useConfirmDialog()

  const fetchPayments = async (page = currentPage) => {
    setLoading(true)

    // Get current user
    const meResponse = await fetch('/api/auth/me')
    const meData = await meResponse.json()
    if (meData.user) {
      setCurrentUserId(meData.user.id)
      setIsAdmin(meData.user.role === 'admin')
    }

    const response = await fetch(`/api/payments?page=${page}&limit=10`)
    const data = await response.json()
    setPayments(data.payments || [])
    setPagination(data.pagination || { total: 0, page: 1, limit: 10, totalPages: 0 })
    setLoading(false)
  }

  useEffect(() => {
    fetchPayments()
  }, [])

  const handleMarkPaid = async (paymentId: string) => {
    const confirmed = await confirm({
      title: 'Xác nhận thanh toán',
      description: 'Bạn có chắc muốn đánh dấu thanh toán này là đã chuyển khoản?',
      confirmText: 'Đã thanh toán',
    })
    if (!confirmed) return

    const response = await fetch('/api/payments', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, paid: true }),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error('Cập nhật thanh toán thất bại: ' + data.error)
    } else {
      toast.success('Đã đánh dấu đã thanh toán')
      fetchPayments()
    }
  }

  const filteredPayments = payments // API already filters by user for non-admins

  const pendingPayments = filteredPayments.filter((p) => !p.paid)
  const paidPayments = filteredPayments.filter((p) => p.paid)

  const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg">
          <CreditCard className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Thanh toán</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Quản lý thanh toán' : 'Theo dõi thanh toán của bạn'}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
          <CardHeader className="p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground lg:text-sm">Chờ thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-4">
            <p className="text-xl font-bold text-orange-600 lg:text-2xl">{formatCurrency(totalPending)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20">
          <CardHeader className="p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground lg:text-sm">Đã thanh toán</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-4">
            <p className="text-xl font-bold text-green-600 lg:text-2xl">{formatCurrency(totalPaid)}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground lg:text-sm">Chưa trả</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-4">
            <p className="text-xl font-bold lg:text-2xl">{pendingPayments.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardHeader className="p-3 lg:p-4">
            <CardTitle className="text-xs font-medium text-muted-foreground lg:text-sm">Hoàn thành</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0 lg:p-4">
            <p className="text-xl font-bold lg:text-2xl">{paidPayments.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Payments Section */}
      {pendingPayments.length > 0 && (
        <Card className="border-0 shadow-lg border-l-4 border-l-orange-500">
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
              Cần thanh toán
            </CardTitle>
            <CardDescription className="text-xs lg:text-sm">
              Các khoản cần chuyển khoản
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 lg:p-6">
            {/* Mobile Card View */}
            <div className="flex flex-col gap-3 md:hidden">
              {pendingPayments.map((payment) => (
                <Card
                  key={payment.id}
                  className="border border-border/50 bg-muted/30 overflow-hidden"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                          <Calendar className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {payment.bookings?.centers?.name || 'Không rõ'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {payment.bookings?.match_date
                              ? new Date(payment.bookings.match_date).toLocaleDateString('vi-VN')
                              : '-'}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-orange-500">Chưa trả</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-muted-foreground">Số tiền</p>
                        <p className="text-lg font-bold text-orange-600">
                          {formatCurrency(payment.amount)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/bookings/${payment.booking_id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleMarkPaid(payment.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Đã chuyển
                        </Button>
                      </div>
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
                    {isAdmin && <TableHead>Người dùng</TableHead>}
                    <TableHead>Đặt sân</TableHead>
                    <TableHead>Ngày</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPayments.map((payment) => (
                    <TableRow key={payment.id} className="bg-orange-50/50 dark:bg-orange-950/10">
                      {isAdmin && (
                        <TableCell className="font-medium">
                          {payment.profiles?.username || payment.users?.username || '-'}
                        </TableCell>
                      )}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {payment.bookings?.centers?.name || 'Không rõ'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.bookings?.match_date
                          ? new Date(payment.bookings.match_date).toLocaleDateString('vi-VN')
                          : '-'}
                      </TableCell>
                      <TableCell className="font-bold text-orange-600">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/bookings/${payment.booking_id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleMarkPaid(payment.id)}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Đã chuyển
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Payments */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="p-4 lg:p-6">
          <CardTitle className="text-base lg:text-lg">
            {isAdmin ? 'Tất cả thanh toán' : 'Lịch sử thanh toán'}
          </CardTitle>
          <CardDescription className="text-xs lg:text-sm">
            {isAdmin ? 'Quản lý tất cả thanh toán' : 'Lịch sử thanh toán của bạn'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 lg:p-6">
          {loading ? (
            <p className="text-center py-4 text-muted-foreground">Đang tải...</p>
          ) : filteredPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CreditCard className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Chưa có thanh toán nào</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="flex flex-col gap-3 md:hidden">
                {filteredPayments.map((payment) => (
                  <Card
                    key={payment.id}
                    className="border border-border/50 bg-muted/30 overflow-hidden"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${payment.paid ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-orange-500 to-amber-500'}`}>
                            <CreditCard className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {payment.bookings?.centers?.name || 'Không rõ'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {payment.bookings?.match_date
                                ? new Date(payment.bookings.match_date).toLocaleDateString('vi-VN')
                                : '-'}
                            </p>
                          </div>
                        </div>
                        <Badge className={payment.paid ? 'bg-green-500' : 'bg-orange-500'}>
                          {payment.paid ? 'Đã trả' : 'Chưa trả'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          {isAdmin && (
                            <p className="text-xs text-muted-foreground mb-1">
                              {payment.profiles?.username || payment.users?.username || '-'}
                            </p>
                          )}
                          <p className={`text-lg font-bold ${payment.paid ? 'text-green-600' : 'text-orange-600'}`}>
                            {formatCurrency(payment.amount)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/bookings/${payment.booking_id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!payment.paid && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkPaid(payment.id)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Đã chuyển
                            </Button>
                          )}
                        </div>
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
                      {isAdmin && <TableHead>Người dùng</TableHead>}
                      <TableHead>Đặt sân</TableHead>
                      <TableHead>Ngày</TableHead>
                      <TableHead>Số tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        {isAdmin && (
                          <TableCell className="font-medium">
                            {payment.profiles?.username || payment.users?.username || '-'}
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            {payment.bookings?.centers?.name || 'Không rõ'}
                          </div>
                        </TableCell>
                        <TableCell>
                          {payment.bookings?.match_date
                            ? new Date(payment.bookings.match_date).toLocaleDateString('vi-VN')
                            : '-'}
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                        <TableCell>
                          <Badge className={payment.paid ? 'bg-green-500' : 'bg-orange-500'}>
                            {payment.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/bookings/${payment.booking_id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!payment.paid && (
                            <Button
                              size="sm"
                              onClick={() => handleMarkPaid(payment.id)}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Đã chuyển
                            </Button>
                          )}
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
                disabled={pagination.page === 1 || loading}
                onClick={() => {
                  const newPage = pagination.page - 1
                  setCurrentPage(newPage)
                  fetchPayments(newPage)
                }}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(page =>
                    page === 1 ||
                    page === pagination.totalPages ||
                    Math.abs(page - pagination.page) <= 1
                  )
                  .map((page, index, arr) => (
                    <span key={page}>
                      {index > 0 && arr[index - 1] !== page - 1 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={page === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        className="w-8 h-8 p-0"
                        disabled={loading}
                        onClick={() => {
                          setCurrentPage(page)
                          fetchPayments(page)
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
                disabled={pagination.page === pagination.totalPages || loading}
                onClick={() => {
                  const newPage = pagination.page + 1
                  setCurrentPage(newPage)
                  fetchPayments(newPage)
                }}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      {dialog}
    </div>
  )
}
