"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()
  const isWorkspace = pathname === "/dashboard" || pathname === "/admin"

  return (
    <footer className={`site-footer ${isWorkspace ? "workspace-footer" : ""}`}>
      <div className="footer-row">
        <p className="footer-credit"><strong>MWIT TINY</strong></p>
        <nav className="footer-links" aria-label="ข้อมูลบริการ">
          <Link href="/tos">ข้อกำหนดการใช้บริการ</Link>
          <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link>
          <Link href="/report">รายงานการละเมิด</Link>
        </nav>
      </div>
      <div className="footer-secondary">
        <div className="space-y-1">
          <p>พัฒนาโดย นายสิรวิชญ์ ดำขำ 34.10</p>
          <p>ดูแลโดย คณะกรรมการนักเรียนมัลติมีเดีย</p>
        </div>
        <span><a href="mailto:admin@mwit.link">admin@mwit.link</a> · <a href="https://github.com/mwit-sc" target="_blank" rel="noreferrer">GitHub</a></span>
      </div>
    </footer>
  )
}
