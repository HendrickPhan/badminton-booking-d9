'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Settings, Percent, Users } from 'lucide-react'

interface Settings {
  female_discount_percent: number
  female_discount_enabled: boolean
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    female_discount_percent: 0,
    female_discount_enabled: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings || {
          female_discount_percent: 0,
          female_discount_enabled: false,
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error('Lưu thất bại: ' + data.error)
      } else {
        toast.success('Đã lưu cài đặt')
        fetchSettings()
      }
    } catch (error) {
      toast.error('Lỗi khi lưu cài đặt')
    }
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-slate-500 to-gray-500 shadow-lg">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold lg:text-3xl">Cài đặt</h1>
          <p className="text-sm text-muted-foreground">Cấu hình hệ thống</p>
        </div>
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-pink-500" />
            <CardTitle>Ưu đãi theo giới tính</CardTitle>
          </div>
          <CardDescription>
            Cấu hình giảm giá cho thành viên nữ
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="discount-toggle">Bật giảm giá cho nữ</Label>
              <p className="text-sm text-muted-foreground">
                Thành viên nữ sẽ được giảm giá theo phần trăm được chỉ định
              </p>
            </div>
            <Switch
              id="discount-toggle"
              checked={settings.female_discount_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, female_discount_enabled: checked })
              }
            />
          </div>

          {settings.female_discount_enabled && (
            <div className="space-y-2">
              <Label htmlFor="discount-percent">Phần trăm giảm giá (%)</Label>
              <div className="flex items-center gap-4">
                <Input
                  id="discount-percent"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={settings.female_discount_percent}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      female_discount_percent: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="max-w-[200px]"
                />
                <Badge variant="outline" className="text-lg">
                  {settings.female_discount_percent}% giảm
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Ví dụ: Nếu giá sân là 100.000 VNĐ và giảm 20%, thành viên nữ chỉ trả 80.000 VNĐ
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button onClick={handleSave} disabled={saving} className="btn-gradient">
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Hướng dẫn sử dụng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Cách tính giảm giá
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Giảm giá được áp dụng tự động khi tính toán chi phí chia đều</li>
              <li>Chỉ áp dụng cho thành viên có giới tính là "Nữ"</li>
              <li>Phần trăm giảm có thể từ 0% đến 100%</li>
            </ul>
          </div>
          <div className="rounded-lg bg-blue-50 dark:bg-blue-950 p-4 space-y-2">
            <h4 className="font-medium">Ví dụ thực tế:</h4>
            <p className="text-sm text-muted-foreground">
              Tổng chi phí: 200.000 VNĐ, 4 người (2 nam, 2 nữ), giảm 50% cho nữ
            </p>
            <ul className="text-sm space-y-1">
              <li>• Tổng sau giảm: 150.000 VNĐ (2 nữ × 25.000 giảm = 50.000 VNĐ)</li>
              <li>• Mỗi nam trả: 50.000 VNĐ</li>
              <li>• Mỗi nữ trả: 25.000 VNĐ</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
