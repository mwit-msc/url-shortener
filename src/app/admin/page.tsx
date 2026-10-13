"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/app-shell"
import { AdminStats } from "@/components/admin/admin-stats"
import { CustomRequestsPanel } from "@/components/admin/custom-requests-panel"
import { UserManagement } from "@/components/admin/user-management"
import { DomainManagement } from "@/components/admin/domain-management"
import { QrGeneratorSettingsPanel } from "@/components/admin/qr-generator-settings"
import { LinkModeration } from "@/components/admin/link-moderation"
import { AbuseReportsPanel } from "@/components/admin/abuse-reports-panel"
import { AdminLogsPanel } from "@/components/admin/admin-logs-panel"
import { useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"
import { ClipboardList, Flag, Globe, Link2, ScrollText, ShieldCheck, Users } from "lucide-react"

const items = [
  { value: "requests", label: "คำขอที่กำหนดเอง", icon: ClipboardList },
  { value: "abuse", label: "รายงานการละเมิด", icon: Flag },
  { value: "users", label: "ผู้ใช้", icon: Users },
  { value: "domains", label: "โดเมนและการตั้งค่า", icon: Globe },
  { value: "links", label: "การกลั่นกรองลิงก์", icon: Link2 },
  { value: "logs", label: "บันทึกการดำเนินการ", icon: ScrollText },
]

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [active, setActive] = useState("requests")
  const isAuthorized = status === "authenticated" && session?.user?.role === UserRole.ADMIN

  useEffect(() => {
    if (status === "loading") return
    if (!session) router.replace("/auth/signin")
    else if (session.user?.role !== UserRole.ADMIN) router.replace("/unauthorized")
  }, [session, status, router])

  if (!isAuthorized || !session) {
    return <div className="status-page"><div className="text-center"><div className="animate-spin rounded-full size-9 border-2 border-border border-t-primary mx-auto mb-4" /><p className="text-muted-foreground text-sm">กำลังโหลด...</p></div></div>
  }

  return (
    <AppShell user={session.user} items={items} active={active} onNavigate={setActive} admin>
      <div className="page-heading">
        <div><h1>แผงผู้ดูแลระบบ</h1><p>จัดการผู้ใช้ ลิงก์ และการตั้งค่าระบบ</p></div>
        <span className="page-heading-note"><ShieldCheck size={15} />ผู้ดูแลระบบ</span>
      </div>
      <div className="mb-7"><AdminStats /></div>
      {active === "requests" && <CustomRequestsPanel />}
      {active === "abuse" && <AbuseReportsPanel />}
      {active === "users" && <UserManagement />}
      {active === "domains" && <div className="space-y-6"><DomainManagement /><QrGeneratorSettingsPanel /></div>}
      {active === "links" && <LinkModeration />}
      {active === "logs" && <AdminLogsPanel />}
    </AppShell>
  )
}
