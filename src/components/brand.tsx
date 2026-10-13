import Link from "next/link"
import { Link2 } from "lucide-react"

export function Brand() {
  return (
    <Link href="/dashboard" className="brand" aria-label="MWIT TINY — แดชบอร์ด">
      <span className="brand-mark"><Link2 size={23} strokeWidth={1.8} /></span>
      <span className="brand-copy"><strong>MWIT TINY</strong><small>URL Shortener by mwit.link</small></span>
    </Link>
  )
}
