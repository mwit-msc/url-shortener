"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { UserRole } from "@prisma/client"
import { BarChart3, Link } from "lucide-react"

interface DashboardStatsProps {
  userId: string
  userRole: UserRole
  linkLimit: number
}

interface Stats {
  totalLinks: number
  totalClicks: number
  activeLinks: number
  pendingRequests?: number
}

export function DashboardStats({ userRole, linkLimit }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats>({
    totalLinks: 0,
    totalClicks: 0,
    activeLinks: 0,
  })
  const [, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats")
      const data = await response.json()

      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const usagePercentage = userRole === UserRole.USER ? (stats.totalLinks / linkLimit) * 100 : 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            สถิติ
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalLinks}</div>
              <div className="text-xs text-muted-foreground">ลิงก์ทั้งหมด</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{stats.totalClicks}</div>
              <div className="text-xs text-muted-foreground">คลิกทั้งหมด</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {userRole === UserRole.USER && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link className="h-5 w-5" />
              ขีดจำกัดการใช้งาน
            </CardTitle>
            <CardDescription>
              ใช้แล้ว {stats.totalLinks} จาก {linkLimit} ลิงก์
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={usagePercentage} className="w-full" />
            <p className="text-xs text-muted-foreground mt-2">เหลือ {linkLimit - stats.totalLinks} ลิงก์</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ประเภทบัญชี</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">บทบาท:</span>
              <span className="text-sm font-medium">
                {userRole === UserRole.ADMIN && "ผู้ดูแลระบบ"}
                {userRole === UserRole.SPECIAL_USER && "ผู้ใช้พิเศษ"}
                {userRole === UserRole.USER && "ผู้ใช้ทั่วไป"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">ขีดจำกัดลิงก์:</span>
              <span className="text-sm font-medium">{userRole === UserRole.USER ? linkLimit : "ไม่จำกัด"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">URL ที่กำหนดเอง:</span>
              <span className="text-sm font-medium">
                {userRole === UserRole.USER ? "ต้องได้รับอนุมัติ" : "ใช้ได้ทันที"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
