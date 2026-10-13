"use client"

import { usePathname } from "next/navigation"
import { ArrowUpRight } from "lucide-react"
import { Brand } from "@/components/brand"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export function PublicHeader() {
  const pathname = usePathname()
  if (pathname === "/dashboard" || pathname === "/admin" || pathname === "/") return null

  return (
    <header className="public-header">
      <Brand />
      <div className="public-header-actions">
        <a className="school-link" href="https://mwit.ac.th" target="_blank" rel="noreferrer">MWIT <ArrowUpRight size={15} /></a>
        <ThemeToggle />
      </div>
    </header>
  )
}
