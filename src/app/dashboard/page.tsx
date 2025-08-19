import { requireAuth } from "@/lib/auth-utils"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CreateLinkForm } from "@/components/dashboard/create-link-form"
import { LinksList } from "@/components/dashboard/links-list"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function DashboardPage() {
  const user = await requireAuth()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader user={user} />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">แดชบอร์ด</h1>
          <p className="text-muted-foreground">สร้างและจัดการลิงก์สั้นของคุณ</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Tabs defaultValue="create" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="create">สร้างลิงก์</TabsTrigger>
                <TabsTrigger value="links">ลิงก์ของฉัน</TabsTrigger>
              </TabsList>

              <TabsContent value="create">
                <CreateLinkForm user={user} />
              </TabsContent>

              <TabsContent value="links">
                <LinksList userId={user.id} userRole={user.role} />
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <DashboardStats userId={user.id} userRole={user.role} linkLimit={user.linkLimit} />
          </div>
        </div>
      </div>
    </div>
  )
}
