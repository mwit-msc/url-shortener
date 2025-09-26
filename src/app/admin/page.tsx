import { requireAdmin } from "@/lib/auth-utils"
import { AdminHeader } from "@/components/admin/admin-header"
import { AdminStats } from "@/components/admin/admin-stats"
import { CustomRequestsPanel } from "@/components/admin/custom-requests-panel"
import { UserManagement } from "@/components/admin/user-management"
import { DomainManagement } from "@/components/admin/domain-management"
import { LinkModeration } from "@/components/admin/link-moderation"
import { AbuseReportsPanel } from "@/components/admin/abuse-reports-panel"
import { AdminLogsPanel } from "@/components/admin/admin-logs-panel"
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
          <div className="overflow-x-auto pb-2">
            <TabsList className="inline-flex w-auto min-w-full h-auto p-1 gap-1 justify-start">
              <TabsTrigger
                value="requests"
                className="flex-shrink-0 px-3 py-2 text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden sm:inline">คำขอที่กำหนดเอง</span>
                <span className="sm:hidden">คำขอ</span>
              </TabsTrigger>
              <TabsTrigger
                value="abuse"
                className="flex-shrink-0 px-3 py-2 text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden sm:inline">รายงานการละเมิด</span>
                <span className="sm:hidden">รายงาน</span>
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="flex-shrink-0 px-3 py-2 text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                ผู้ใช้
              </TabsTrigger>
              <TabsTrigger
                value="domains"
                className="flex-shrink-0 px-3 py-2 text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                โดเมน
              </TabsTrigger>
              <TabsTrigger
                value="links"
                className="flex-shrink-0 px-3 py-2 text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden sm:inline">การกลั่นกรองลิงก์</span>
                <span className="sm:hidden">ลิงก์</span>
              </TabsTrigger>
              <TabsTrigger
                value="logs"
                className="flex-shrink-0 px-3 py-2 text-sm whitespace-nowrap data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <span className="hidden sm:inline">บันทึกการดำเนินการ</span>
                <span className="sm:hidden">บันทึก</span>
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

          <TabsContent value="logs">
            <AdminLogsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
