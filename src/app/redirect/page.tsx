import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReportAbuseDialog } from "@/components/public/report-abuse-dialog"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ExternalLink, Shield } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

interface RedirectPageProps {
  searchParams: Promise<{
    url?: string
    domain?: string
    code?: string
  }>
}

export default async function RedirectPage({ searchParams }: RedirectPageProps) {
  const { url, domain, code } = await searchParams

  // Server-side redirect if URL is available
  if (url) {
    redirect(url)
  }

  if (!url || !domain || !code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">
              ลิงก์ไม่ถูกต้อง
            </CardTitle>
            <CardDescription>
              ไม่พบลิงก์ที่คุณต้องการเข้าถึง หรือข้อมูลไม่ครบถ้วน
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button asChild>
              <Link href="/">
                กลับไปยังหน้าหลัก
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ExternalLink className="w-12 h-12 text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold">กำลังเปลี่ยนเส้นทาง...</CardTitle>
          <CardDescription>
            คุณกำลังถูกเปลี่ยนเส้นทางไปยังลิงก์ภายนอก
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="space-y-2">
              <div>
                <span className="font-semibold text-sm">ลิงก์สั้น:</span>
                <p className="font-mono text-sm">{domain}/{code}</p>
              </div>
              <div>
                <span className="font-semibold text-sm">ปลายทาง:</span>
                <p className="text-sm break-all text-muted-foreground">{url}</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button asChild size="lg">
              <a href={url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-5 h-5 mr-2" />
                ไปยังปลายทาง
              </a>
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <ReportAbuseDialog 
              shortCode={code} 
              domain={domain}
              trigger={
                <Button variant="outline" size="sm" className="flex-1">
                  <Shield className="w-4 h-4 mr-2" />
                  รายงานการละเมิด
                </Button>
              }
            />
            <Button asChild variant="outline" size="sm" className="flex-1">
              <Link href="/">
                กลับหน้าหลัก
              </Link>
            </Button>
          </div>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              ตรวจสอบ URL ปลายทางก่อนดำเนินการเสมอ รายงานลิงก์ที่น่าสงสัยเพื่อช่วยรักษาความปลอดภัยของบริการเรา
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}