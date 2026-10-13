"use client"

import { useState, useEffect } from "react"
import { Users, Link2, Clock, MousePointer2 } from "lucide-react"

interface AdminStatsData {
  totalUsers: number
  totalLinks: number
  totalClicks: number
  pendingRequests: number
  activeUsers: number
  recentLinks: number
}

export function AdminStats() {
  const [stats, setStats] = useState<AdminStatsData | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/admin/stats", { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Unable to load stats")
        return response.json()
      })
      .then(setStats)
      .catch(() => { if (!controller.signal.aborted) setError(true) })
    return () => controller.abort()
  }, [])

  const metrics = [
    { label: "จำนวนผู้ใช้ทั้งหมด", value: stats?.totalUsers, icon: Users, footer: `${stats?.activeUsers ?? 0} คนที่ใช้งานในเดือนนี้` },
    { label: "จำนวนลิงก์ทั้งหมด", value: stats?.totalLinks, icon: Link2, footer: `${stats?.recentLinks ?? 0} สร้างในสัปดาห์นี้` },
    { label: "จำนวนคลิกทั้งหมด", value: stats?.totalClicks, icon: MousePointer2, footer: "รวมทุกลิงก์" },
    { label: "คำขอที่รอดำเนินการ", value: stats?.pendingRequests, icon: Clock, footer: stats?.pendingRequests ? "ต้องการการตรวจสอบ" : "ดำเนินการครบถ้วนแล้ว!" },
  ]

  return (
    <div className="metric-grid mb-0" aria-label="สถิติระบบ" aria-live="polite">
      {metrics.map(({ label, value, icon: Icon, footer }) => (
        <article className="metric-card" key={label}>
          <div className="metric-label"><span className="metric-icon"><Icon size={16} /></span>{label}</div>
          <div className="metric-value">{value === undefined ? "—" : value.toLocaleString()}</div>
          <div className="metric-footer">{error ? "โหลดสถิติไม่สำเร็จ" : !stats ? "กำลังโหลด..." : footer}</div>
        </article>
      ))}
    </div>
  )
}
