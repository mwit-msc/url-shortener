"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CreateLinkForm } from "@/components/dashboard/create-link-form"
import { LinksList } from "@/components/dashboard/links-list"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserRole } from "@prisma/client"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    setIsAuthorized(true)
  }, [session, status, router])

  if (status === "loading" || !isAuthorized || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  const user = session.user

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-6 sm:py-8">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            แดชบอร์ด
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
            สร้างและจัดการลิงก์สั้นของคุณ พร้อมติดตามสถิติการใช้งาน
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:gap-8 xl:grid-cols-4">
          {/* Stats Section - Full width on mobile, sidebar on desktop */}
          <div className="xl:col-span-1 xl:order-2">
            <DashboardStats userId={user.id} userRole={user.role} linkLimit={user.linkLimit} />
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 xl:order-1">
            <Tabs defaultValue="create" className="space-y-6">
              <TabsList className={`grid sm:block sm:justify-between w-full h-12 p-1 ${
                user.role === UserRole.SPECIAL_USER || user.role === UserRole.ADMIN
                  ? 'grid-cols-1 sm:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                <TabsTrigger value="create" className="text-sm md:text-base whitespace-nowrap h-10 flex-shrink-0">
                  สร้างลิงก์ใหม่
                </TabsTrigger>
                <TabsTrigger value="links" className="text-sm md:text-base whitespace-nowrap h-10 flex-shrink-0">
                  ลิงก์ของฉัน
                </TabsTrigger>
                {(user.role === UserRole.SPECIAL_USER || user.role === UserRole.ADMIN) && (
                  <TabsTrigger value="analytics" className="text-sm md:text-base whitespace-nowrap h-10 flex-shrink-0">
                    Analytics
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="create" className="space-y-0">
                <CreateLinkForm user={user} />
              </TabsContent>

              <TabsContent value="links" className="space-y-0">
                <LinksList userId={user.id} userRole={user.role} />
              </TabsContent>

              {(user.role === UserRole.SPECIAL_USER || user.role === UserRole.ADMIN) && (
                <TabsContent value="analytics" className="space-y-0">
                  <AnalyticsDashboard userRole={user.role} />
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>

        {/* Quick Help Section */}
        <div className="mt-12 pt-8 border-t">
          <div className="text-center space-y-4">
            <h3 className="text-lg sm:text-xl font-semibold">ต้องการความช่วยเหลือ?</h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              หากคุณพบปัญหาในการใช้งานหรือต้องการคำแนะนำ สามารถติดต่อทีมสนับสนุนได้
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
