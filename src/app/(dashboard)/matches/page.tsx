'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Trophy } from 'lucide-react'
import { toast } from 'sonner'

interface Player {
  id: string
  username: string
  avatar_url: string | null
}

interface MatchData {
  id: string
  match_type: '1v1' | '2v2'
  team1_player1: string | null
  team1_player2: string | null
  team2_player1: string | null
  team2_player2: string | null
  team1_score: number | null
  team2_score: number | null
  winner_team: number | null
  played_at: string
  team1_player1_profile: Player | null
  team1_player2_profile: Player | null
  team2_player1_profile: Player | null
  team2_player2_profile: Player | null
}

export default function MatchesPage() {
  const [matches, setMatches] = useState<MatchData[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    match_type: '1v1' as '1v1' | '2v2',
    team1_player1: '',
    team1_player2: '',
    team2_player1: '',
    team2_player2: '',
    team1_score: '0',
    team2_score: '0',
  })

  const fetchData = async () => {
    setLoading(true)
    const [matchesRes, playersRes] = await Promise.all([
      fetch('/api/matches'),
      fetch('/api/admin/users'),
    ])

    const matchesData = await matchesRes.json()
    const playersData = await playersRes.json()

    setMatches(matchesData.matches || [])
    setPlayers(playersData.users || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    setSubmitting(true)

    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          match_type: formData.match_type,
          team1_player1: formData.team1_player1,
          team1_player2: formData.match_type === '2v2' ? formData.team1_player2 : null,
          team2_player1: formData.team2_player1,
          team2_player2: formData.match_type === '2v2' ? formData.team2_player2 : null,
          team1_score: parseInt(formData.team1_score),
          team2_score: parseInt(formData.team2_score),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error('Lưu trận đấu thất bại: ' + data.error)
      } else {
        toast.success('Đã ghi nhận trận đấu')
        setDialogOpen(false)
        resetForm()
        fetchData()
      }
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      match_type: '1v1',
      team1_player1: '',
      team1_player2: '',
      team2_player1: '',
      team2_player2: '',
      team1_score: '0',
      team2_score: '0',
    })
  }

  const getPlayerName = (player: Player | null) => player?.username || '-'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl">Trận đấu</h1>
            <p className="text-sm text-muted-foreground">Ghi nhận và xem kết quả trận đấu</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button onClick={() => setDialogOpen(true)} className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" />
            Ghi nhận trận
          </Button>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ghi nhận kết quả trận đấu</DialogTitle>
              <DialogDescription>Nhập thông tin và tỷ số trận đấu</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="match_type">Loại trận</Label>
                  <Select
                    value={formData.match_type}
                    onValueChange={(value) =>
                      value && setFormData({ ...formData, match_type: value as '1v1' | '2v2' })
                    }
                  >
                    <SelectTrigger>
                      <span>{formData.match_type === '1v1' ? 'Đơn (1 vs 1)' : 'Đôi (2 vs 2)'}</span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1v1">Đơn (1 vs 1)</SelectItem>
                      <SelectItem value="2v2">Đôi (2 vs 2)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-blue-600">Đội 1</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={formData.team1_player1}
                      onValueChange={(value) =>
                        value && setFormData({ ...formData, team1_player1: value })
                      }
                    >
                      <SelectTrigger>
                        <span>{players.find(p => p.id === formData.team1_player1)?.username || 'Người chơi 1'}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {formData.match_type === '2v2' && (
                      <Select
                        value={formData.team1_player2}
                        onValueChange={(value) =>
                          value && setFormData({ ...formData, team1_player2: value })
                        }
                      >
                        <SelectTrigger>
                          <span>{players.find(p => p.id === formData.team1_player2)?.username || 'Người chơi 2'}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {players.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-semibold text-red-600">Đội 2</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Select
                      value={formData.team2_player1}
                      onValueChange={(value) =>
                        value && setFormData({ ...formData, team2_player1: value })
                      }
                    >
                      <SelectTrigger>
                        <span>{players.find(p => p.id === formData.team2_player1)?.username || 'Người chơi 1'}</span>
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.username}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {formData.match_type === '2v2' && (
                      <Select
                        value={formData.team2_player2}
                        onValueChange={(value) =>
                          value && setFormData({ ...formData, team2_player2: value })
                        }
                      >
                        <SelectTrigger>
                          <span>{players.find(p => p.id === formData.team2_player2)?.username || 'Người chơi 2'}</span>
                        </SelectTrigger>
                        <SelectContent>
                          {players.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tỷ số Đội 1</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.team1_score}
                      onChange={(e) => setFormData({ ...formData, team1_score: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tỷ số Đội 2</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.team2_score}
                      onChange={(e) => setFormData({ ...formData, team2_score: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Đang lưu...' : 'Ghi nhận'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Lịch sử trận đấu</CardTitle>
          <CardDescription>Tất cả kết quả trận đấu đã ghi nhận</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4 text-muted-foreground">Đang tải...</p>
          ) : matches.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Chưa có trận đấu nào được ghi nhận</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="flex flex-col gap-3 md:hidden">
                {matches.map((match) => (
                  <Card key={match.id} className="border shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="font-medium">
                          {match.match_type === '1v1' ? 'Đơn' : 'Đôi'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(match.played_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm">
                          <p className="font-medium text-blue-600">
                            {getPlayerName(match.team1_player1_profile)}
                            {match.team1_player2_profile && (
                              <span className="text-muted-foreground font-normal"> & {getPlayerName(match.team1_player2_profile)}</span>
                            )}
                          </p>
                        </div>
                        <div className="text-lg font-bold px-3">
                          {match.team1_score} - {match.team2_score}
                        </div>
                        <div className="text-sm text-right">
                          <p className="font-medium text-red-600">
                            {getPlayerName(match.team2_player1_profile)}
                            {match.team2_player2_profile && (
                              <span className="text-muted-foreground font-normal"> & {getPlayerName(match.team2_player2_profile)}</span>
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        {match.winner_team === 0 ? (
                          <Badge variant="secondary" className="w-full justify-center">Hòa</Badge>
                        ) : match.winner_team ? (
                          <div className="flex items-center justify-center gap-1 text-sm font-medium text-green-600">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            Đội {match.winner_team} thắng
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
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
                      <TableHead>Loại</TableHead>
                      <TableHead>Đội 1</TableHead>
                      <TableHead>Tỷ số</TableHead>
                      <TableHead>Đội 2</TableHead>
                      <TableHead>Người thắng</TableHead>
                      <TableHead>Ngày</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {matches.map((match) => (
                      <TableRow key={match.id}>
                        <TableCell>
                          <Badge variant="outline" className="font-medium">
                            {match.match_type === '1v1' ? 'Đơn' : 'Đôi'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {getPlayerName(match.team1_player1_profile)}
                            {match.team1_player2_profile && (
                              <span className="text-muted-foreground"> & {getPlayerName(match.team1_player2_profile)}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-bold text-lg">
                          {match.team1_score} - {match.team2_score}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {getPlayerName(match.team2_player1_profile)}
                            {match.team2_player2_profile && (
                              <span className="text-muted-foreground"> & {getPlayerName(match.team2_player2_profile)}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {match.winner_team === 0 ? (
                            <Badge variant="secondary">Hòa</Badge>
                          ) : match.winner_team ? (
                            <div className="flex items-center gap-1">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium">Đội {match.winner_team}</span>
                            </div>
                          ) : '-'}
                        </TableCell>
                        <TableCell>{new Date(match.played_at).toLocaleDateString('vi-VN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
