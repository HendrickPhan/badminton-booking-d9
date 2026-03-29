'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trophy, Medal } from 'lucide-react'

interface RankingData {
  id: string
  user_id: string
  singles_rating: number
  doubles_rating: number
  singles_wins: number
  singles_losses: number
  doubles_wins: number
  doubles_losses: number
  updated_at: string
  profiles: {
    username: string
    avatar_url: string | null
  }
}

export default function RankingsPage() {
  const [rankings, setRankings] = useState<RankingData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRankings()
  }, [])

  const fetchRankings = async () => {
    setLoading(true)
    const response = await fetch('/api/rankings')
    const data = await response.json()
    setRankings(data.rankings || [])
    setLoading(false)
  }

  const singlesRankings = [...rankings].sort((a, b) => b.singles_rating - a.singles_rating)
  const doublesRankings = [...rankings].sort((a, b) => b.doubles_rating - a.doubles_rating)

  const getWinRate = (wins: number, losses: number) => {
    const total = wins + losses
    return total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0'
  }

  const getRankBadge = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />
    return <span className="font-bold text-muted-foreground">{index + 1}</span>
  }

  const getRankBadgeSmall = (index: number) => {
    if (index === 0) return <Trophy className="h-4 w-4 text-yellow-500" />
    if (index === 1) return <Medal className="h-4 w-4 text-gray-400" />
    if (index === 2) return <Medal className="h-4 w-4 text-amber-600" />
    return <span className="font-bold text-sm">{index + 1}</span>
  }

  const renderMobileCards = (data: RankingData[], type: 'singles' | 'doubles') => (
    <div className="flex flex-col gap-3">
      {data.map((ranking, index) => (
        <Card key={ranking.id} className="border shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8">
                {getRankBadgeSmall(index)}
              </div>
              <Avatar className="h-10 w-10">
                <AvatarImage src={ranking.profiles?.avatar_url || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                  {ranking.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{ranking.profiles?.username || '-'}</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-bold text-lg">
                    {type === 'singles' ? ranking.singles_rating : ranking.doubles_rating}
                  </span>
                  <span className="text-muted-foreground">điểm</span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-green-600 font-medium">
                    {type === 'singles' ? ranking.singles_wins : ranking.doubles_wins}W
                  </span>
                  <span className="text-muted-foreground">-</span>
                  <span className="text-red-600 font-medium">
                    {type === 'singles' ? ranking.singles_losses : ranking.doubles_losses}L
                  </span>
                </div>
                <Badge variant="secondary" className="mt-1">
                  {type === 'singles'
                    ? getWinRate(ranking.singles_wins, ranking.singles_losses)
                    : getWinRate(ranking.doubles_wins, ranking.doubles_losses)}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderTable = (data: RankingData[], type: 'singles' | 'doubles') => (
    <>
      {/* Mobile Card View */}
      <div className="md:hidden">
        {renderMobileCards(data, type)}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Hạng</TableHead>
              <TableHead>Người chơi</TableHead>
              <TableHead className="text-right">Điểm</TableHead>
              <TableHead className="text-right">Thắng</TableHead>
              <TableHead className="text-right">Thua</TableHead>
              <TableHead className="text-right">Tỷ lệ thắng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((ranking, index) => (
              <TableRow key={ranking.id}>
                <TableCell>{getRankBadge(index)}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={ranking.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                        {ranking.profiles?.username?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{ranking.profiles?.username || '-'}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-bold text-lg">
                  {type === 'singles' ? ranking.singles_rating : ranking.doubles_rating}
                </TableCell>
                <TableCell className="text-right text-green-600 font-medium">
                  {type === 'singles' ? ranking.singles_wins : ranking.doubles_wins}
                </TableCell>
                <TableCell className="text-right text-red-600 font-medium">
                  {type === 'singles' ? ranking.singles_losses : ranking.doubles_losses}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {type === 'singles'
                    ? getWinRate(ranking.singles_wins, ranking.singles_losses)
                    : getWinRate(ranking.doubles_wins, ranking.doubles_losses)}
                  %
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 shadow-lg">
          <Trophy className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Bảng xếp hạng</h1>
          <p className="text-sm text-muted-foreground">Xếp hạng người chơi dựa trên kết quả trận đấu</p>
        </div>
      </div>

      <Tabs defaultValue="singles">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="singles">Đơn</TabsTrigger>
          <TabsTrigger value="doubles">Đôi</TabsTrigger>
        </TabsList>
        <TabsContent value="singles">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Xếp hạng đơn</CardTitle>
              <CardDescription>Điểm ELO cho trận đấu 1vs1</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4 text-muted-foreground">Đang tải...</p>
              ) : singlesRankings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">Chưa có trận đơn nào được ghi nhận</p>
                </div>
              ) : (
                renderTable(singlesRankings, 'singles')
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="doubles">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Xếp hạng đôi</CardTitle>
              <CardDescription>Điểm ELO cho trận đấu 2vs2</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center py-4 text-muted-foreground">Đang tải...</p>
              ) : doublesRankings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Trophy className="h-12 w-12 text-muted-foreground/50" />
                  <p className="mt-4 text-muted-foreground">Chưa có trận đôi nào được ghi nhận</p>
                </div>
              ) : (
                renderTable(doublesRankings, 'doubles')
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
