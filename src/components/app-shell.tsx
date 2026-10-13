"use client"

import { useState, type ReactNode } from "react"
import Link from "next/link"
import { signOut } from "next-auth/react"
import { ArrowLeft, ArrowUpRight, ChevronDown, ChevronRight, Flag, HelpCircle, LayoutDashboard, LogOut, Menu, ShieldCheck, UserRound, type LucideIcon } from "lucide-react"
import { Brand } from "@/components/brand"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface NavigationItem {
  value: string
  label: string
  icon: LucideIcon
}

interface AppShellProps {
  user: { name?: string | null; email?: string | null; image?: string | null; role: string }
  items: NavigationItem[]
  active: string
  onNavigate: (value: string) => void
  admin?: boolean
  children: ReactNode
}

export function AppShell({ user, items, active, onNavigate, admin = false, children }: AppShellProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const roleLabel = user.role === "ADMIN" ? "ผู้ดูแลระบบ" : user.role === "SPECIAL_USER" ? "ผู้ใช้พิเศษ" : "ผู้ใช้ทั่วไป"
  const activeLabel = items.find(item => item.value === active)?.label

  const sidebar = (
    <div className="sidebar-content">
      <Brand />
      <div className="workspace-label">
        {admin ? <ShieldCheck size={20} /> : <UserRound size={20} />}
        <div><strong>{admin ? "แผงผู้ดูแลระบบ" : "พื้นที่ทำงานของคุณ"}</strong><small>{roleLabel}</small></div>
      </div>
      <p className="sidebar-caption">{admin ? "จัดการระบบ" : "จัดการลิงก์"}</p>
      <nav className="sidebar-nav" aria-label={admin ? "จัดการระบบ" : "จัดการลิงก์"}>
        {items.map(({ value, label, icon: Icon }) => (
          <button key={value} type="button" aria-current={active === value ? "page" : undefined} onClick={() => { onNavigate(value); setMenuOpen(false) }}><Icon /><span>{label}</span></button>
        ))}
      </nav>
      <div className="sidebar-separator" />
      <nav className="sidebar-nav" aria-label="ลิงก์เพิ่มเติม">
        {admin ? <Link href="/dashboard"><ArrowLeft /><span>กลับไปยังแดชบอร์ด</span></Link> : user.role === "ADMIN" && <Link href="/admin"><LayoutDashboard /><span>แผงผู้ดูแลระบบ</span></Link>}
        <Link href="/report"><Flag /><span>รายงานการละเมิด</span></Link>
        <Link href="/privacy"><ShieldCheck /><span>นโยบายความเป็นส่วนตัว</span></Link>
      </nav>
      <div className="sidebar-bottom">
        <div className="support-box">
          <HelpCircle size={21} strokeWidth={1.6} />
          <strong>ต้องการความช่วยเหลือ?</strong>
          <p>ติดต่อทีมสนับสนุนได้</p>
          <a href="mailto:admin@mwit.link">admin@mwit.link <ArrowUpRight size={14} /></a>
        </div>
        <span className="sidebar-credit">Mahidol Wittayanusorn School</span>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <a href="#workspace-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-card focus:p-3">ข้ามไปยังเนื้อหา</a>
      <aside className="app-sidebar">{sidebar}</aside>
      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-location">
            <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
              <DialogTrigger asChild><Button variant="ghost" size="icon" className="mobile-menu" aria-label="เปิดเมนู"><Menu size={21} /></Button></DialogTrigger>
              <DialogContent className="mobile-sidebar bg-[var(--sidebar)] top-0 left-0 translate-x-0 translate-y-0" aria-describedby={undefined}>
                <DialogTitle className="sr-only">เมนู</DialogTitle>
                {sidebar}
              </DialogContent>
            </Dialog>
            <span className="topbar-section">{admin ? "แผงผู้ดูแลระบบ" : "พื้นที่ทำงาน"}</span><ChevronRight size={14} /><span>{activeLabel}</span>
          </div>
          <div className="topbar-actions">
            <a className="school-link" href="https://mwit.ac.th" target="_blank" rel="noreferrer">MWIT <ArrowUpRight size={14} /></a>
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button type="button" className="profile-button" aria-label="เมนูบัญชี">
                  <Avatar className="size-9 border"><AvatarImage src={user.image || ""} alt="" /><AvatarFallback className="bg-accent text-accent-foreground">{user.name?.charAt(0) || user.email?.charAt(0) || "U"}</AvatarFallback></Avatar>
                  <span className="profile-copy"><strong>{user.name || user.email}</strong><small>{roleLabel}</small></span>
                  <ChevronDown size={14} className="profile-chevron text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel className="font-normal"><p className="truncate font-medium">{user.name}</p><p className="truncate text-xs text-muted-foreground mt-1">{user.email}</p><p className="text-xs text-muted-foreground mt-1">{roleLabel}</p></DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/signin" })}><LogOut size={16} />ออกจากระบบ</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <div id="workspace-content" className="app-content" tabIndex={-1}>{children}</div>
      </div>
    </div>
  )
}
