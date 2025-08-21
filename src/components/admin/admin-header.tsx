import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface AdminHeaderProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
  }
}

export function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Button asChild variant="ghost" size="sm" className="w-fit">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                กลับไปยังแดชบอร์ด
              </Link>
            </Button>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-xl lg:text-2xl font-bold">แผงผู้ดูแลระบบ</h1>
              <Badge variant="destructive">ผู้ดูแลระบบ</Badge>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ThemeToggle />
            <div className="text-sm text-muted-foreground break-all">
              เข้าสู่ระบบในชื่อ {user.name || user.email}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
