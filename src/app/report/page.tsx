import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportAbuseDialog } from "@/components/public/report-abuse-dialog"
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-12 h-12 text-red-500" />
          </div>
          <CardTitle className="text-2xl font-bold">รายงานการละเมิด</CardTitle>
          <CardDescription>
            ช่วยเรารักษาความปลอดภัยของบริการย่อ URL โดยการรายงานเนื้อหาที่ไม่เหมาะสม
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {url && domain && code ? (
            <div>
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
                    <Button size="lg" className="w-full sm:w-auto">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      รายงานลิงก์นี้
                    </Button>
                  }
                />
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-semibold mb-2">วิธีการรายงานลิงก์</h3>
                <p className="text-sm text-muted-foreground">
                  หากต้องการรายงานลิงก์เฉพาะ กรุณาเข้าไปที่ลิงก์นั้นก่อน หรือติดต่อเราพร้อม URL เต็ม
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">สิ่งที่คุณสามารถรายงานได้</h4>
                <ul className="text-sm text-muted-foreground space-y-1 text-left">
                  <li>• สแปมหรือเนื้อหาที่ไม่พึงประสงค์</li>
                  <li>• มัลแวร์หรือการหลอกลวงทางอินเทอร์เน็ต</li>
                  <li>• เนื้อหาที่ผิดกฎหมาย</li>
                  <li>• การละเมิดลิขสิทธิ์</li>
                  <li>• การคุกคามหรือการล่วงละเมิด</li>
                  <li>• เนื้อหาสำหรับผู้ใหญ่/ไม่เหมาะสม</li>
                  <li>• การหลอกลวงหรือฉ้อโกง</li>
                </ul>
              </div>
            </div>
          )}

          <div className="pt-4 border-t">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                รายงานทั้งหมดจะได้รับการตรวจสอบโดยทีมควบคุมของเรา ขอบคุณที่ช่วยรักษาความปลอดภัยของบริการเรา
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild variant="outline">
                  <Link href="/">หน้าหลัก</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/dashboard">แดชบอร์ด</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}