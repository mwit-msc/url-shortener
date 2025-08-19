import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"

interface UnauthorizedProps {
  searchParams: Promise<{
    reason?: string
    allowed_host?: string
  }>
}

export default async function Unauthorized({ searchParams }: UnauthorizedProps) {
  const { reason, allowed_host: allowedHost } = await searchParams

  if (reason === "host_restriction" && allowedHost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">การเข้าถึงถูกจำกัด</CardTitle>
            <CardDescription>การเข้าสู่ระบบและฟังก์ชันการจัดการถูกจำกัดเฉพาะโดเมนที่ได้รับอนุญาต</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              กรุณาเข้าใช้งานจาก <span className="font-mono font-medium">{allowedHost}</span> เพื่อใช้งานการเข้าสู่ระบบและฟีเจอร์การจัดการ
            </p>
            <p className="text-xs text-muted-foreground">
              ลิงก์สั้นยังคงทำงานได้ปกติจากทุกโดเมน
            </p>
            <div className="flex gap-2 justify-center">
              <Button asChild>
                <Link href={`https://${allowedHost}`}>ไปยัง {allowedHost}</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-destructive">การเข้าถึงถูกปฏิเสธ</CardTitle>
          <CardDescription>คุณไม่มีสิทธิ์ในการเข้าถึงทรัพยากรนี้</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">ติดต่อผู้ดูแลระบบหากคุณเชื่อว่านี่เป็นข้อผิดพลาด</p>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link href="/dashboard">แดชบอร์ด</Link>
            </Button>
            <Button asChild>
              <Link href="/">หน้าหลัก</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
