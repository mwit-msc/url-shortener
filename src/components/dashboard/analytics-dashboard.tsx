"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserRole } from "@prisma/client"
import {
  BarChart3,
  MousePointer,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  TrendingUp,
  Eye,
  ExternalLink
} from "lucide-react"
import type { UserAnalyticsOverview, LinkAnalyticsSummary } from "@/lib/analytics"

interface AnalyticsDashboardProps {
  userRole: UserRole
}

export function AnalyticsDashboard({ userRole }: AnalyticsDashboardProps) {
  const [overview, setOverview] = useState<UserAnalyticsOverview | null>(null)
  const [selectedLinkAnalytics, setSelectedLinkAnalytics] = useState<LinkAnalyticsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchOverview = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/analytics/overview")
      const data = await response.json()

      if (response.ok) {
        setOverview(data)
      } else {
        console.error("Error fetching analytics overview:", data.error)
      }
    } catch (error) {
      console.error("Error fetching analytics overview:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchLinkAnalytics = async (linkId: string) => {
    try {
      const response = await fetch(`/api/analytics/links/${linkId}`)
      const data = await response.json()

      if (response.ok) {
        setSelectedLinkAnalytics(data)
      } else {
        console.error("Error fetching link analytics:", data.error)
      }
    } catch (error) {
      console.error("Error fetching link analytics:", error)
    }
  }

  useEffect(() => {
    if (userRole !== UserRole.USER) {
      fetchOverview()
    }
  }, [userRole])

  // Only show analytics for SPECIAL_USER and ADMIN
  if (userRole === UserRole.USER) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analytics ขั้นสูง</h3>
          <p className="text-muted-foreground text-center max-w-md">
            คุณสมบัตินี้พร้อมใช้งานสำหรับผู้ใช้พิเศษและผู้ดูแลระบบเท่านั้น
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!overview) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">ไม่สามารถโหลดข้อมูล Analytics</h3>
          <Button onClick={fetchOverview} variant="outline">
            ลองใหม่อีกครั้ง
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">ลิงก์ทั้งหมด</p>
                <p className="text-2xl font-bold">{overview.totalLinks.toLocaleString()}</p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">คลิกทั้งหมด</p>
                <p className="text-2xl font-bold">{overview.totalClicks.toLocaleString()}</p>
              </div>
              <MousePointer className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">คลิกเฉลี่ย/ลิงก์</p>
                <p className="text-2xl font-bold">{overview.avgClicksPerLink.toFixed(1)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">อัตราผู้เข้าชม</p>
                <p className="text-2xl font-bold">
                  {overview.totalLinks > 0 ? ((overview.totalClicks / overview.totalLinks) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Links */}
      <Card>
        <CardHeader>
          <CardTitle>ลิงก์ที่มีประสิทธิภาพสูงสุด</CardTitle>
          <CardDescription>ลิงก์ที่ได้รับคลิกมากที่สุด 10 อันดับแรก</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {overview.topPerformingLinks.map((link, index) => (
              <div
                key={link.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-sm truncate">
                        {link.domain}/{link.shortCode}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`https://${link.domain}/${link.shortCode}`, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                    {link.title && (
                      <p className="text-sm text-muted-foreground truncate">{link.title}</p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">{link.originalUrl}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-lg font-semibold">{link.clicks.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">คลิก</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchLinkAnalytics(link.id)}
                  >
                    <BarChart3 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Click Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            แนวโน้มคลิกรายวัน
          </CardTitle>
          <CardDescription>คลิกในช่วง 30 วันที่ผ่านมา</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {overview.clickTrends.length > 0 ? (
              <div className="grid grid-cols-7 gap-1">
                {overview.clickTrends.slice(-7).map((trend) => (
                  <div key={trend.date} className="text-center p-2 border rounded">
                    <div className="text-xs text-muted-foreground">
                      {new Date(trend.date).toLocaleDateString('th-TH', { weekday: 'short' })}
                    </div>
                    <div className="text-sm font-semibold">{trend.clicks}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">ยังไม่มีข้อมูลการคลิก</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Link Analytics Modal/Panel */}
      {selectedLinkAnalytics && (
        <Card>
          <CardHeader>
            <CardTitle>Analytics รายละเอียด</CardTitle>
            <CardDescription>ข้อมูลการคลิกแบบละเอียดสำหรับลิงก์ที่เลือก</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Device Types */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  ประเภทอุปกรณ์
                </h4>
                <div className="space-y-2">
                  {selectedLinkAnalytics.topDevices.map((device) => (
                    <div key={device.device} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">{device.device}</span>
                      <span className="text-sm font-semibold">{device.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Browsers */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  เบราว์เซอร์
                </h4>
                <div className="space-y-2">
                  {selectedLinkAnalytics.topBrowsers.map((browser) => (
                    <div key={browser.browser} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">{browser.browser}</span>
                      <span className="text-sm font-semibold">{browser.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Countries */}
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  ประเทศ
                </h4>
                <div className="space-y-2">
                  {selectedLinkAnalytics.topCountries.map((country) => (
                    <div key={country.country} className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">{country.country}</span>
                      <span className="text-sm font-semibold">{country.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{selectedLinkAnalytics.totalClicks}</p>
                  <p className="text-sm text-muted-foreground">คลิกทั้งหมด</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{selectedLinkAnalytics.uniqueClicks}</p>
                  <p className="text-sm text-muted-foreground">ผู้เข้าชมไม่ซ้ำ</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedLinkAnalytics.topReferers.length}
                  </p>
                  <p className="text-sm text-muted-foreground">แหล่งอ้างอิง</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {selectedLinkAnalytics.dailyClicks.length}
                  </p>
                  <p className="text-sm text-muted-foreground">วันที่มีการคลิก</p>
                </div>
              </div>

              <div className="mt-4 text-center">
                <Button
                  variant="outline"
                  onClick={() => setSelectedLinkAnalytics(null)}
                >
                  ปิด
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}