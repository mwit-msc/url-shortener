"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { BarChart3, HelpCircle, Link2, Plus, ShieldCheck } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { CreateLinkForm } from "@/components/dashboard/create-link-form"
import { LinksList } from "@/components/dashboard/links-list"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"
import { AnalyticsDashboard } from "@/components/dashboard/analytics-dashboard"
import { UserRole } from "@prisma/client"

const headings: Record<string, { title: string; description: string }> = {
  create: { title: "สร้างลิงก์ย่อ", description: "สร้างและจัดการลิงก์ย่อของคุณ พร้อมติดตามสถิติการใช้งาน" },
  links: { title: "ลิงก์ของฉัน", description: "จัดการลิงก์ย่อที่คุณสร้างไว้" },
  analytics: { title: "Analytics", description: "ติดตามสถิติการใช้งานลิงก์ของคุณ" },
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [active, setActive] = useState("create")
  const [statsRevision, setStatsRevision] = useState(0)

  useEffect(() => {
    if (status !== "loading" && !session) router.replace("/auth/signin")
  }, [session, status, router])

  if (status !== "authenticated" || !session) {
    return <div className="status-page"><div className="text-center"><div className="animate-spin rounded-full size-9 border-2 border-border border-t-primary mx-auto mb-4" /><p className="text-muted-foreground text-sm">Loading...</p></div></div>
  }

  const user = session.user
  const canViewAnalytics = user.role === UserRole.SPECIAL_USER || user.role === UserRole.ADMIN
  const items = [
    { value: "create", label: "สร้างลิงก์ใหม่", icon: Plus },
    { value: "links", label: "ลิงก์ของฉัน", icon: Link2 },
    ...(canViewAnalytics ? [{ value: "analytics", label: "Analytics", icon: BarChart3 }] : []),
  ]
  const visibleActive = active === "analytics" && !canViewAnalytics ? "create" : active
  const heading = headings[visibleActive]

  return (
    <AppShell user={user} items={items} active={visibleActive} onNavigate={setActive}>
      <div className="page-heading">
        <div><h1>{heading.title}</h1><p>{heading.description}</p></div>
        <span className="page-heading-note"><ShieldCheck size={15} />MWIT TINY</span>
      </div>
      <div className={`dashboard-layout ${visibleActive === "create" ? "creating-link" : ""}`}><DashboardStats userId={user.id} userRole={user.role} linkLimit={user.linkLimit} refreshKey={statsRevision} />
      <div className="dashboard-panel">{visibleActive === "create" && <CreateLinkForm user={user} onCreated={() => setStatsRevision(value => value + 1)} />}
      {visibleActive === "links" && <LinksList userId={user.id} userRole={user.role} onCreate={() => setActive("create")} />}
      {visibleActive === "analytics" && canViewAnalytics && <AnalyticsDashboard userRole={user.role} />}
      </div></div>
      <div className="workspace-help"><HelpCircle size={15} /><span>ต้องการความช่วยเหลือ?</span><a href="mailto:admin@mwit.link">admin@mwit.link</a></div>
    </AppShell>
  )
}
