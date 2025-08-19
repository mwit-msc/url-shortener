import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportAbuseDialog } from "@/components/public/report-abuse-dialog"
import { ReportAbuseForm } from "@/components/public/report-abuse-form"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Shield, AlertTriangle } from "lucide-react"
import Link from "next/link"

interface ReportPageProps {
  searchParams: Promise<{
    url?: string
    domain?: string
    code?: string
  }>
}

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const { url, domain, code } = await searchParams

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">รายงานการละเมิด</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            ช่วยเรารักษาความปลอดภัยของบริการย่อ URL โดยการรายงานเนื้อหาที่ไม่เหมาะสม
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-1">
          {/* Report Form */}
          <div className="space-y-6">
            {url && domain && code ? (
              // Specific link report with dialog
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                      รายงานลิงก์เฉพาะ
                    </CardTitle>
                    <CardDescription>
                      คุณกำลังรายงานลิงก์เฉพาะที่ระบุในพารามิเตอร์
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-muted p-4 rounded-lg mb-6">
                      <h3 className="font-semibold mb-2">ลิงก์ที่ต้องการรายงาน:</h3>
                      <p className="font-mono text-sm break-all">{domain}/{code}</p>
                      {url && (
                        <p className="text-sm text-muted-foreground mt-1 break-all">
                          → {url}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex justify-center">
                      <ReportAbuseDialog 
                        shortCode={code} 
                        domain={domain}
                        trigger={
                          <Button size="lg">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            รายงานลิงก์นี้
                          </Button>
                        }
                      />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Alternative: Full form for specific link */}
                <ReportAbuseForm 
                  prefilledUrl={url}
                  prefilledDomain={domain}
                  prefilledCode={code}
                />
              </div>
            ) : (
              // General report form
              <ReportAbuseForm />
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-12 pt-8 border-t">
          <div className="text-center space-y-4">
            <div className="flex gap-4 justify-center flex-wrap">
              <Button asChild variant="outline">
                <Link href="/">หน้าหลัก</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">แดชบอร์ด</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/tos">ข้อกำหนดการใช้งาน</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}