"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Link, Clock } from "lucide-react"

interface AdminStatsData {
  totalUsers: number
  totalLinks: number
  totalClicks: number
  pendingRequests: number
  activeUsers: number
  recentLinks: number
}

export function AdminStats() {
  const [stats, setStats] = useState<AdminStatsData>({
    totalUsers: 0,
    totalLinks: 0,
    totalClicks: 0,
    pendingRequests: 0,
    activeUsers: 0,
    recentLinks: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium truncate">จำนวนผู้ใช้ทั้งหมด</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">{stats.activeUsers} คนที่ใช้งานในเดือนนี้</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium truncate">จำนวนลิงก์ทั้งหมด</CardTitle>
          <Link className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalLinks}</div>
          <p className="text-xs text-muted-foreground">{stats.recentLinks} สร้างในสัปดาห์นี้</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium truncate">จำนวนคลิกทั้งหมด</CardTitle>
          <div className="h-4 w-4 text-muted-foreground flex-shrink-0">📊</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalClicks.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">รวมทุกลิงก์</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium truncate">คำขอที่รอดำเนินการ</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.pendingRequests}</div>
          <p className="text-xs text-muted-foreground">
            {stats.pendingRequests > 0 ? "ต้องการการตรวจสอบ" : "ดำเนินการครบถ้วนแล้ว!"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
