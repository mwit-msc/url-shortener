"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { UserRole } from "@prisma/client"
import { Check, Link2, MousePointer2, CircleCheck, Gauge } from "lucide-react"

interface DashboardStatsProps {
  userId: string
  userRole: UserRole
  linkLimit: number
  refreshKey?: number
}

interface Stats {
  totalLinks: number
  totalClicks: number
  activeLinks: number
}

export function DashboardStats({ userRole, linkLimit, refreshKey = 0 }: DashboardStatsProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/stats", { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Unable to load stats")
        return response.json()
      })
      .then(data => { setStats(data); setError(false) })
      .catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [refreshKey])

  const limited = userRole === UserRole.USER
  const usage = stats && linkLimit > 0 ? Math.min(100, stats.totalLinks / linkLimit * 100) : 0
  const metrics = [
    { label: "ลิงก์ทั้งหมด", value: stats?.totalLinks, icon: Link2, footer: "ลิงก์ของฉัน" },
    { label: "คลิกทั้งหมด", value: stats?.totalClicks, icon: MousePointer2, footer: "รวมทุกลิงก์" },
    { label: "ลิงก์ที่ใช้งานได้", value: stats?.activeLinks, icon: CircleCheck, footer: "พร้อมใช้งาน" },
  ]

  return (
    <div className="metric-grid" aria-label="สถิติการใช้งาน" aria-live="polite">
      {metrics.map(({ label, value, icon: Icon, footer }) => (
        <article className="metric-card" key={label}>
          <div className="metric-label"><span className="metric-icon"><Icon size={16} /></span>{label}</div>
          <div className="metric-value">{value === undefined ? "—" : value.toLocaleString()}</div>
          <div className="metric-footer">{label === "ลิงก์ที่ใช้งานได้" && stats && <Check size={13} />}{error ? "โหลดสถิติไม่สำเร็จ" : !stats ? "Loading..." : footer}</div>
        </article>
      ))}
      <article className="metric-card">
        <div className="metric-label"><span className="metric-icon"><Gauge size={16} /></span>ขีดจำกัดลิงก์</div>
        <div className="metric-value">{limited ? <>{stats?.totalLinks ?? "—"} <small>/ {linkLimit}</small></> : "ไม่จำกัด"}</div>
        <div className="metric-footer">{limited ? <><Progress value={usage} className="h-1.5 flex-1" /><span>{stats ? `เหลือ ${Math.max(0, linkLimit - stats.totalLinks)}` : "—"}</span></> : userRole === UserRole.ADMIN ? "ผู้ดูแลระบบ" : "ผู้ใช้พิเศษ"}</div>
      </article>
    </div>
  )
}
