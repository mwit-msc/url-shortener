"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "มีปัญหาเกี่ยวกับการตั้งค่าเซิร์ฟเวอร์"
      case "AccessDenied":
        return "การเข้าถึงถูกปฏิเสธ คุณไม่มีสิทธิ์ในการเข้าสู่ระบบ"
      case "Verification":
        return "โทเค็นการยืนยันหมดอายุหรือถูกใช้ไปแล้ว"
      default:
        return "เกิดข้อผิดพลาดระหว่างการยืนยันตัวตน"
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-destructive">
            การเข้าสู่ระบบล้มเหลว
          </CardTitle>
          <CardDescription>{getErrorMessage(error)}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Button asChild>
            <Link href="/auth/signin">ลองอีกครั้ง</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
