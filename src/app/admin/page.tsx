import { requireAdmin } from "@/lib/auth-utils"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStats } from "@/components/admin/admin-stats"
import { CustomRequestsPanel } from "@/components/admin/custom-requests-panel"
import { UserManagement } from "@/components/admin/user-management"
import { DomainManagement } from "@/components/admin/domain-management"
import { LinkModeration } from "@/components/admin/link-moderation"
import { AbuseReportsPanel } from "@/components/admin/abuse-reports-panel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function AdminPage() {
  const user = await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">แผงผู้ดูแลระบบ</h1>
            <p className="text-muted-foreground">จัดการผู้ใช้ ลิงก์ และการตั้งค่าระบบ</p>
        </div>

        <div className="mb-8">
          <AdminStats />
        </div>

        <Tabs defaultValue="requests" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full min-w-max grid-cols-5 gap-x-1 md:gap-x-2">
              <TabsTrigger 
                value="requests" 
                className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap"
              >
                <span className="sm:hidden">คำขอ</span>
                <span className="hidden sm:inline">คำขอที่กำหนดเอง</span>
              </TabsTrigger>
              <TabsTrigger 
                value="abuse" 
                className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap"
              >
                <span className="sm:hidden">รายงาน</span>
                <span className="hidden sm:inline">รายงานการละเมิด</span>
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap"
              >
                ผู้ใช้
              </TabsTrigger>
              <TabsTrigger 
                value="domains" 
                className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap"
              >
                โดเมน
              </TabsTrigger>
              <TabsTrigger 
                value="links" 
                className="text-xs sm:text-sm px-2 sm:px-3 whitespace-nowrap"
              >
                <span className="sm:hidden">กลั่นกรอง</span>
                <span className="hidden sm:inline">การกลั่นกรองลิงก์</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="requests">
            <CustomRequestsPanel />
          </TabsContent>

          <TabsContent value="abuse">
            <AbuseReportsPanel />
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="domains">
            <DomainManagement />
          </TabsContent>

          <TabsContent value="links">
            <LinkModeration />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
