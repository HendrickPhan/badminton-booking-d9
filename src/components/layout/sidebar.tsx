'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  MapPin,
  Calendar,
  CreditCard,
  Swords,
  Trophy,
  User,
  LogOut,
  ChevronDown,
  Menu,
  X,
  Settings,
  Feather,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'Trang chủ', icon: LayoutDashboard, gradient: 'from-violet-500 to-purple-500' },
  { href: '/admin/users', label: 'Người dùng', icon: Users, adminOnly: true, gradient: 'from-blue-500 to-cyan-500' },
  { href: '/admin/centers', label: 'Sân cầu', icon: MapPin, adminOnly: true, gradient: 'from-emerald-500 to-teal-500' },
  { href: '/admin/settings', label: 'Cài đặt', icon: Settings, adminOnly: true, gradient: 'from-slate-500 to-gray-500' },
  { href: '/bookings', label: 'Đặt sân', icon: Calendar, gradient: 'from-orange-500 to-amber-500' },
  { href: '/payments', label: 'Thanh toán', icon: CreditCard, gradient: 'from-pink-500 to-rose-500' },
  { href: '/matches', label: 'Trận đấu', icon: Swords, gradient: 'from-indigo-500 to-violet-500' },
  { href: '/matches/rankings', label: 'Xếp hạng', icon: Trophy, gradient: 'from-yellow-500 to-orange-500' },
]

const bottomNavItems = [
  { href: '/profile', label: 'Tài khoản', icon: User, gradient: 'from-slate-500 to-gray-500' },
]

interface SidebarProps {
  isAdmin: boolean
}

export function Sidebar({ isAdmin }: SidebarProps) {
  const pathname = usePathname()
  const [adminOpen, setAdminOpen] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || isAdmin
  )

  const regularItems = filteredNavItems.filter(item => !item.adminOnly)
  const adminItems = filteredNavItems.filter(item => item.adminOnly)

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar px-4 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-foreground"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
            <Feather className="h-4 w-4 text-white" />
          </div>
          <span className="font-semibold text-sidebar-foreground">Book Cầu Lông Q9</span>
        </div>
        <div className="w-10" />
      </div>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo - Desktop only */}
        <div className="hidden h-20 items-center gap-3 border-b border-sidebar-border px-6 lg:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30">
            <Feather className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Book Cầu Lông Q9</h1>
            <p className="text-xs text-sidebar-foreground/60">Quận 9, TP.HCM</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
              <Feather className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">Book Cầu Lông Q9</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-accent text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col overflow-y-auto px-3 py-4">
          {/* Main Navigation */}
          <div className="space-y-1">
            {regularItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'nav-item group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'active bg-sidebar-accent text-sidebar-foreground shadow-lg'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 shrink-0',
                    isActive && 'bg-gradient-to-br shadow-lg',
                    isActive && item.gradient
                  )}
                  >
                    <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground')} />
                  </div>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          {/* Admin Section */}
          {isAdmin && adminItems.length > 0 && (
            <div className="mt-6">
              <button
                onClick={() => setAdminOpen(!adminOpen)}
                className="flex w-full items-center justify-between px-4 py-2 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/50"
              >
                <span>Quản trị</span>
                <ChevronDown className={cn('h-4 w-4 transition-transform', adminOpen && 'rotate-180')} />
              </button>
              {adminOpen && (
                <div className="mt-2 space-y-1">
                  {adminItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'nav-item group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                          isActive
                            ? 'active bg-sidebar-accent text-sidebar-foreground shadow-lg'
                            : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                        )}
                      >
                        <div className={cn(
                          'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 shrink-0',
                          isActive && 'bg-gradient-to-br shadow-lg',
                          isActive && item.gradient
                        )}
                        >
                          <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground')} />
                        </div>
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Bottom Section */}
          <div className="mt-auto border-t border-sidebar-border pt-3">
            {bottomNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'nav-item group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'active bg-sidebar-accent text-sidebar-foreground'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                  )}
                >
                  <div className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-200 shrink-0',
                    isActive && 'bg-gradient-to-br shadow-lg',
                    isActive && item.gradient
                  )}
                  >
                    <Icon className={cn('h-4 w-4', isActive ? 'text-white' : 'text-sidebar-foreground/70 group-hover:text-sidebar-foreground')} />
                  </div>
                  <span>{item.label}</span>
                </Link>
              )
            })}
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-sidebar-foreground/70 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-accent/50 transition-all duration-200 group-hover:bg-red-500/20 shrink-0">
                  <LogOut className="h-4 w-4" />
                </div>
                <span>Đăng xuất</span>
              </button>
            </form>
          </div>
        </nav>
      </aside>
    </>
  )
}
