"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { UserRole } from "@prisma/client"
import { BarChart3, Flag, Link, Shield } from "lucide-react"
import NextLink from "next/link"

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
    <div className="space-y-4 sm:space-y-6">
      {/* Main Stats Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            สถิติการใช้งาน
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:gap-6">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1">
                {stats.totalLinks.toLocaleString()}
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">ลิงก์ทั้งหมด</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary mb-1">
                {stats.totalClicks.toLocaleString()}
              </div>
              <div className="text-sm sm:text-base text-muted-foreground">คลิกทั้งหมด</div>
            </div>
          </div>
          
          {/* Active Links */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base font-medium">ลิงก์ที่ใช้งานได้</span>
              <span className="text-lg sm:text-xl font-bold text-green-600">
                {stats.activeLinks.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage Limit Card - Only for regular users */}
      {userRole === UserRole.USER && (
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Link className="h-5 w-5 sm:h-6 sm:w-6 text-amber-500" />
              ขีดจำกัดการใช้งาน
            </CardTitle>
            <CardDescription className="text-sm sm:text-base">
              ใช้แล้ว {stats.totalLinks} จาก {linkLimit} ลิงก์
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm sm:text-base">
                <span>ความคืบหน้า</span>
                <span className="font-medium">{Math.round(usagePercentage)}%</span>
              </div>
              <Progress value={usagePercentage} className="w-full h-2 sm:h-3" />
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-sm sm:text-base text-muted-foreground">เหลือ</span>
              <span className={`text-lg sm:text-xl font-bold ${
                linkLimit - stats.totalLinks <= 2 ? 'text-red-500' : 
                linkLimit - stats.totalLinks <= 5 ? 'text-amber-500' : 'text-green-600'
              }`}>
                {linkLimit - stats.totalLinks} ลิงก์
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Type Card */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">ข้อมูลบัญชี</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm sm:text-base text-muted-foreground">บทบาท</span>
              <span className="text-sm sm:text-base font-medium">
                {userRole === UserRole.ADMIN && "ผู้ดูแลระบบ"}
                {userRole === UserRole.SPECIAL_USER && "ผู้ใช้พิเศษ"}
                {userRole === UserRole.USER && "ผู้ใช้ทั่วไป"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t">
              <span className="text-sm sm:text-base text-muted-foreground">ขีดจำกัดลิงก์</span>
              <span className="text-sm sm:text-base font-medium">
                {userRole === UserRole.USER ? `${linkLimit} ลิงก์` : "ไม่จำกัด"}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-t">
              <span className="text-sm sm:text-base text-muted-foreground">URL ที่กำหนดเอง</span>
              <span className="text-sm sm:text-base font-medium">
                {userRole === UserRole.USER ? "ต้องได้รับอนุมัติ" : "ใช้ได้ทันที"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg sm:text-xl">การดำเนินการด่วน</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full justify-start text-sm sm:text-base h-10 sm:h-11" asChild>
            <NextLink href="/report" className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              รายงานลิงก์ที่ไม่เหมาะสม
            </NextLink>
          </Button>
          <Button variant="outline" className="w-full justify-start text-sm sm:text-base h-10 sm:h-11" asChild>
            <NextLink href="/privacy" className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              นโยบายความเป็นส่วนตัว
            </NextLink>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
