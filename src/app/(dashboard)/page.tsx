import { getDB } from '@/lib/db'
import { getSession } from '@/lib/auth-session'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CreditCard, Users, Trophy, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

interface UpcomingBooking {
  id: string
  match_date: string
  start_time: string
  end_time: string
  center_id: string | null
  centers: { name: string } | null
  participant_counts: { joined: number }
}

async function getStats() {
  const db = getDB()

  const [
    { count: upcomingBookings },
    { count: totalUsers },
    { count: pendingPayments },
    { count: totalMatches },
  ] = await Promise.all([
    db.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['pending_registration', 'confirmed', 'pending_payment']),
    db.from('users').select('*', { count: 'exact', head: true }),
    db.from('payments').select('*', { count: 'exact', head: true }).eq('paid', false),
    db.from('matches').select('*', { count: 'exact', head: true }),
  ])

  return {
    upcomingBookings: upcomingBookings || 0,
    totalUsers: totalUsers || 0,
    pendingPayments: pendingPayments || 0,
    totalMatches: totalMatches || 0,
  }
}

async function getUpcomingBookings() {
  const db = getDB()

  const today = new Date().toISOString().split('T')[0]

  const { data: bookings } = await db
    .from('bookings')
    .select('id, match_date, start_time, end_time, center_id, status')
    .gte('match_date', today)
    .in('status', ['pending_registration', 'confirmed', 'pending_payment'])
    .order('match_date', { ascending: true })
    .limit(5)

  if (!bookings || bookings.length === 0) return []

  // Type assertion for bookings
  const typedBookings = bookings as Array<{
    id: string
    match_date: string
    start_time: string
    end_time: string
    center_id: string | null
    status: string
  }>

  // Fetch centers separately
  const centerIds = typedBookings.map(b => b.center_id).filter(Boolean) as string[]
  const { data: centers } = centerIds.length > 0
    ? await db.from('centers').select('id, name').in('id', centerIds)
    : { data: [] }
  const typedCenters = (centers || []) as Array<{ id: string; name: string }>
  const centersMap = new Map(typedCenters.map(c => [c.id, c]))

  // Fetch participant counts
  const { data: participants } = await db
    .from('booking_participants')
    .select('booking_id, status')
    .in('booking_id', typedBookings.map(b => b.id))

  const participantCounts = new Map<string, { joined: number }>()
  const typedParticipants = (participants || []) as Array<{ booking_id: string; status: string }>
  typedParticipants.forEach(p => {
    const counts = participantCounts.get(p.booking_id) || { joined: 0 }
    if (p.status === 'joined') counts.joined++
    participantCounts.set(p.booking_id, counts)
  })

  return typedBookings.map(b => ({
    ...b,
    centers: b.center_id ? centersMap.get(b.center_id) || null : null,
    participant_counts: participantCounts.get(b.id) || { joined: 0 }
  })) as UpcomingBooking[]
}

export default async function DashboardPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const stats = await getStats()
  const upcomingBookings = await getUpcomingBookings()

  const statCards = [
    {
      title: 'Sắp tới',
      value: stats.upcomingBookings,
      description: 'Lịch đặt sân tuần này',
      icon: Calendar,
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-500/10 to-amber-500/10',
      trend: '+12%',
      trendUp: true,
      href: '/bookings',
    },
    {
      title: 'Người chơi',
      value: stats.totalUsers,
      description: 'Tổng người dùng',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-500/10 to-cyan-500/10',
      trend: '+5%',
      trendUp: true,
      href: '/admin/users',
    },
    {
      title: 'Chờ thanh toán',
      value: stats.pendingPayments,
      description: 'Chờ xác nhận',
      icon: CreditCard,
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-500/10 to-rose-500/10',
      trend: '-3%',
      trendUp: false,
      href: '/payments',
    },
    {
      title: 'Trận đấu',
      value: stats.totalMatches,
      description: 'Tổng trận đã ghi',
      icon: Trophy,
      gradient: 'from-violet-500 to-purple-500',
      bgGradient: 'from-violet-500/10 to-purple-500/10',
      trend: '+8%',
      trendUp: true,
      href: '/matches',
    },
  ]

  const quickActions = [
    { href: '/bookings', icon: Calendar, color: 'text-orange-500', title: 'Đặt sân mới', desc: 'Tạo lịch đặt sân' },
    { href: '/matches', icon: Trophy, color: 'text-violet-500', title: 'Ghi trận', desc: 'Lưu kết quả thi đấu' },
    { href: '/payments', icon: CreditCard, color: 'text-pink-500', title: 'Thanh toán', desc: 'Theo dõi công nợ' },
    { href: '/matches/rankings', icon: Users, color: 'text-blue-500', title: 'Xếp hạng', desc: 'Xem bảng xếp hạng' },
  ]

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight lg:text-4xl">
          Xin chào, {session.username}! 👋
        </h1>
        <p className="text-sm text-muted-foreground lg:text-lg">
          Tổng quan hoạt động của cộng đồng cầu lông hôm nay.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link key={stat.title} href={stat.href}>
              <Card
                className="stat-card card-hover group relative overflow-hidden border-0 shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />
                <CardHeader className="relative flex flex-row items-center justify-between pb-2 p-4 lg:p-6">
                  <CardTitle className="text-xs font-medium text-muted-foreground lg:text-sm">
                    {stat.title}
                  </CardTitle>
                  <div className={`hidden h-8 w-8 items-center justify-center rounded-lg sm:flex lg:h-10 lg:w-10 ${`bg-gradient-to-br ${stat.gradient} shadow-lg transition-transform group-hover:scale-110`}`}>
                    <Icon className="h-4 w-4 text-white lg:h-5 lg:w-5" />
                  </div>
                </CardHeader>
                <CardContent className="relative p-4 pt-0 lg:p-6">
                  <div className="text-2xl font-bold lg:text-3xl">{stat.value}</div>
                  <div className="mt-1 hidden items-center gap-2 sm:flex lg:mt-2">
                    <span className={`flex items-center gap-1 text-xs font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-red-500'} lg:text-sm`}>
                      {stat.trendUp ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {stat.trend}
                    </span>
                    <span className="text-xs text-muted-foreground lg:text-sm">{stat.description}</span>
                  </div>
                </CardContent>
                <div className="absolute bottom-2 right-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </Card>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Quick Actions Card */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 lg:h-9 lg:w-9">
                <TrendingUp className="h-4 w-4 text-white lg:h-5 lg:w-5" />
              </div>
              Thao tác nhanh
            </CardTitle>
            <CardDescription className="text-xs lg:text-sm">Các tác vụ thường dùng</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 p-4 pt-0 sm:gap-3 lg:grid-cols-2 lg:gap-4 lg:p-6">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 p-3 transition-all hover:border-primary/30 hover:bg-muted/50 hover:shadow-md sm:gap-3 sm:p-4 lg:p-4"
                >
                  <Icon className={`h-4 w-4 lg:h-5 lg:w-5 ${action.color}`} />
                  <div>
                    <p className="text-xs font-medium lg:text-sm">{action.title}</p>
                    <p className="hidden text-xs text-muted-foreground sm:block">{action.desc}</p>
                  </div>
                </Link>
              )
            })}
          </CardContent>
        </Card>

        {/* Upcoming Matches */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="p-4 lg:p-6">
            <CardTitle className="flex items-center gap-2 text-base lg:text-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 lg:h-9 lg:w-9">
                <Calendar className="h-4 w-4 text-white lg:h-5 lg:w-5" />
              </div>
              Sắp tới
            </CardTitle>
            <CardDescription className="text-xs lg:text-sm">Lịch đặt sắp tới</CardDescription>
          </CardHeader>
          <CardContent className="p-4 pt-0 lg:p-6">
            {upcomingBookings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-4 text-center lg:py-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted lg:h-16 lg:w-16">
                  <Calendar className="h-6 w-6 text-muted-foreground lg:h-8 lg:w-8" />
                </div>
                <p className="mt-3 text-sm font-medium lg:mt-4 lg:text-base">Chưa có lịch đặt sân</p>
                <p className="mt-1 text-xs text-muted-foreground lg:text-sm">
                  Tạo lịch đặt sân để bắt đầu
                </p>
                <Link
                  href="/bookings"
                  className="btn-gradient mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium lg:mt-4 lg:text-sm"
                >
                  <Calendar className="h-4 w-4" />
                  Đặt sân
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <Link
                    key={booking.id}
                    href={`/bookings/${booking.id}`}
                    className="flex items-center justify-between rounded-xl border border-border/50 bg-muted/30 p-3 transition-all hover:border-primary/30 hover:bg-muted/50 hover:shadow-md sm:p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500">
                        <Calendar className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{booking.centers?.name || 'Chưa chọn sân'}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(booking.match_date).toLocaleDateString('vi-VN')} • {booking.start_time?.slice(0, 5)} - {booking.end_time?.slice(0, 5)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-green-600">{booking.participant_counts?.joined || 0}</span>
                    </div>
                  </Link>
                ))}
                <Link
                  href="/bookings"
                  className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-border/50 p-3 text-sm text-muted-foreground transition-all hover:border-primary/30 hover:text-foreground"
                >
                  Xem tất cả
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
