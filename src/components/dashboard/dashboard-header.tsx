"use client"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { UserRole } from "@prisma/client"
import Link from "next/link"
import { signOut } from "next-auth/react"

interface DashboardHeaderProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: UserRole
    linkLimit: number
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge variant="destructive">ผู้ดูแลระบบ</Badge>
      case UserRole.SPECIAL_USER:
        return <Badge variant="secondary">ผู้ใช้พิเศษ</Badge>
      default:
        return <Badge variant="outline">ผู้ใช้</Badge>
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Role Badge */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-xl sm:text-2xl font-bold text-primary hover:text-primary/80 transition-colors">
              MWIT TINY
            </Link>
            <div className="hidden sm:block">
              {getRoleBadge(user.role)}
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Admin Panel Button - Hidden on mobile, shown as icon on tablet */}
            {user.role === UserRole.ADMIN && (
              <>
                <Button asChild variant="outline" className="hidden lg:flex">
                  <Link href="/admin">แผงควบคุมแอดมิน</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="lg:hidden">
                  <Link href="/admin">
                    <span className="hidden sm:inline">แอดมิน</span>
                    <span className="sm:hidden">A</span>
                  </Link>
                </Button>
              </>
            )}

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full">
                  <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                    <AvatarImage src={user.image || ""} alt={user.name || ""} />
                    <AvatarFallback className="text-sm font-medium">
                      {user.name?.charAt(0) || user.email?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 sm:w-72" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
                    {/* Show role badge on mobile in dropdown */}
                    <div className="sm:hidden">
                      {getRoleBadge(user.role)}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()} className="text-base">
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
