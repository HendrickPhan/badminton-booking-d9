'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { User } from '@/types/database'
import { Search, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  user: User | null
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/50 bg-background/80 px-4 backdrop-blur-xl lg:px-6">
      {/* Mobile Menu Button - visible on larger screens too */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Search - hidden on mobile */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="h-10 w-64 rounded-xl border border-input bg-background/50 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User info */}
        <div className="flex items-center gap-2 rounded-xl bg-muted/50 p-1.5 pr-2 sm:pr-4">
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            <AvatarImage src={user?.avatar_url || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-medium text-white">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:block">
            <p className="text-sm font-medium leading-none">{user?.username}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {user?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
            </p>
          </div>
          {user?.role === 'admin' && (
            <Badge className="ml-1 hidden sm:flex bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 text-[10px] px-2 py-0">
              Admin
            </Badge>
          )}
        </div>
      </div>
    </header>
  )
}
