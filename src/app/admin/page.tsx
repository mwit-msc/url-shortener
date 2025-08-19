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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="requests">คำขอที่กำหนดเอง</TabsTrigger>
            <TabsTrigger value="abuse">รายงานการละเมิด</TabsTrigger>
            <TabsTrigger value="users">ผู้ใช้</TabsTrigger>
            <TabsTrigger value="domains">โดเมน</TabsTrigger>
            <TabsTrigger value="links">การกลั่นกรองลิงก์</TabsTrigger>
          </TabsList>

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
