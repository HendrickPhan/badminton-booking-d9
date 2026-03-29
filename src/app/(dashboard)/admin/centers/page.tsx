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
import { Plus, Pencil, Trash2, MapPin as MapPinIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useConfirmDialog } from '@/components/confirm-dialog'

interface Center {
  id: string
  name: string
  address: string | null
  latitude: number | null
  longitude: number | null
  created_at: string
}

export default function CentersPage() {
  const [centers, setCenters] = useState<Center[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingCenter, setEditingCenter] = useState<Center | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
  })
  const { confirm, dialog } = useConfirmDialog()

  const fetchCenters = async () => {
    setLoading(true)
    const response = await fetch('/api/admin/centers')
    const data = await response.json()
    setCenters(data.centers || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchCenters()
  }, [])

  const resetForm = () => {
    setFormData({ name: '', address: '', latitude: '', longitude: '' })
    setEditingCenter(null)
  }

  const handleOpenDialog = (center?: Center) => {
    if (center) {
      setEditingCenter(center)
      setFormData({
        name: center.name,
        address: center.address || '',
        latitude: center.latitude?.toString() || '',
        longitude: center.longitude?.toString() || '',
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const url = '/api/admin/centers'
    const method = editingCenter ? 'PUT' : 'POST'
    const body = {
      ...(editingCenter && { id: editingCenter.id }),
      name: formData.name,
      address: formData.address || null,
      latitude: formData.latitude ? parseFloat(formData.latitude) : null,
      longitude: formData.longitude ? parseFloat(formData.longitude) : null,
    }

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error('Thao tác thất bại: ' + data.error)
      return
    }

    toast.success(editingCenter ? 'Đã cập nhật sân cầu' : 'Đã tạo sân cầu mới')
    fetchCenters()
    setDialogOpen(false)
    resetForm()
  }

  const handleDelete = async (centerId: string) => {
    const confirmed = await confirm({
      title: 'Xác nhận xóa',
      description: 'Bạn có chắc muốn xóa sân cầu này? Hành động này không thể hoàn tác.',
      confirmText: 'Xóa',
      destructive: true,
    })
    if (!confirmed) return

    const response = await fetch('/api/admin/centers', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: centerId }),
    })

    const data = await response.json()

    if (!response.ok) {
      toast.error('Xóa thất bại: ' + data.error)
    } else {
      toast.success('Đã xóa sân cầu')
      fetchCenters()
    }
  }

  const openMap = (lat: number | null, lng: number | null) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
            <MapPinIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold lg:text-3xl">Sân cầu</h1>
            <p className="text-sm text-muted-foreground">Quản lý sân cầu lông</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button onClick={() => handleOpenDialog()} className="btn-gradient">
            <Plus className="mr-2 h-4 w-4" />
            Thêm sân
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCenter ? 'Sửa sân cầu' : 'Thêm sân cầu mới'}</DialogTitle>
              <DialogDescription>
                {editingCenter ? 'Cập nhật thông tin sân cầu' : 'Tạo sân cầu lông mới'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên sân</Label>
                  <Input
                    id="name"
                    placeholder="Nhập tên sân"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Địa chỉ</Label>
                  <Input
                    id="address"
                    placeholder="Nhập địa chỉ"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Vĩ độ</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      placeholder="10.762622"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Kinh độ</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      placeholder="106.660172"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit">{editingCenter ? 'Cập nhật' : 'Tạo mới'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Danh sách sân cầu</CardTitle>
          <CardDescription>Tất cả sân cầu lông đã đăng ký</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-4 text-muted-foreground">Đang tải...</p>
          ) : centers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <MapPinIcon className="h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">Chưa có sân cầu nào</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="flex flex-col gap-3 md:hidden">
                {centers.map((center) => (
                  <Card key={center.id} className="border shadow-sm">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{center.name}</p>
                          <p className="text-sm text-muted-foreground">{center.address || 'Chưa có địa chỉ'}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(center.created_at).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex gap-2 pt-2 border-t">
                        {center.latitude && center.longitude && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => openMap(center.latitude, center.longitude)}
                          >
                            <MapPinIcon className="h-4 w-4 mr-1" />
                            Bản đồ
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleOpenDialog(center)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Sửa
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(center.id)}
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
                      <TableHead>Tên sân</TableHead>
                      <TableHead>Địa chỉ</TableHead>
                      <TableHead>Vị trí</TableHead>
                      <TableHead>Ngày tạo</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {centers.map((center) => (
                      <TableRow key={center.id}>
                        <TableCell className="font-medium">{center.name}</TableCell>
                        <TableCell>{center.address || '-'}</TableCell>
                        <TableCell>
                          {center.latitude && center.longitude ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openMap(center.latitude, center.longitude)}
                            >
                              <MapPinIcon className="mr-2 h-4 w-4" />
                              Xem bản đồ
                            </Button>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>{new Date(center.created_at).toLocaleDateString('vi-VN')}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(center)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(center.id)}>
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
