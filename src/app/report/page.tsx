import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ReportAbuseDialog } from "@/components/public/report-abuse-dialog"
import { ReportAbuseForm } from "@/components/public/report-abuse-form"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { Shield, AlertTriangle, Home, ArrowLeft } from "lucide-react"
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
    <div className="min-h-screen bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Button asChild variant="outline" className="mb-4">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              กลับหน้าหลัก
            </Link>
          </Button>
          
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Shield className="w-12 h-12 text-red-500" />
              </div>
              <CardTitle className="text-3xl font-bold">Report Abuse</CardTitle>
              <CardDescription>
                Help us keep our URL shortening service safe
              </CardDescription>
              <p className="text-sm text-muted-foreground">
                Report inappropriate content and malicious links
              </p>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <div className="space-y-8">
                {url && domain && code ? (
                  // Specific link report with dialog
                  <div className="space-y-8">
                    <section>
                      <h2 className="text-2xl font-semibold mb-4">Specific Link Report</h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">
                        You are reporting a specific link identified in the URL parameters.
                      </p>
                      
                      <div className="bg-muted p-6 rounded-lg space-y-3 not-prose">
                        <h3 className="font-semibold text-lg">Link to Report:</h3>
                        <p className="font-mono text-base break-all bg-background p-3 rounded border">
                          {domain}/{code}
                        </p>
                        {url && (
                          <p className="text-base text-muted-foreground break-all">
                            → {url}
                          </p>
                        )}
                      </div>
                      
                      <div className="flex justify-center mt-6 not-prose">
                        <ReportAbuseDialog 
                          shortCode={code} 
                          domain={domain}
                          trigger={
                            <Button size="lg" className="text-lg px-8 py-4 h-auto">
                              <AlertTriangle className="w-6 h-6 mr-3" />
                              Report This Link
                            </Button>
                          }
                        />
                      </div>
                    </section>
                    
                    <section>
                      <h2 className="text-2xl font-semibold mb-4">Alternative: Full Report Form</h2>
                      <div className="not-prose">
                        <ReportAbuseForm 
                          prefilledUrl={url}
                          prefilledDomain={domain}
                          prefilledCode={code}
                        />
                      </div>
                    </section>
                  </div>
                ) : (
                  // General report form
                  <section>
                    <h2 className="text-2xl font-semibold mb-4">General Report Form</h2>
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      Use this form to report any inappropriate content or malicious links on our platform.
                    </p>
                    <div className="not-prose">
                      <ReportAbuseForm />
                    </div>
                  </section>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 justify-center">
          <Button asChild variant="outline">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              หน้าหลัก
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">
              แดชบอร์ด
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/tos">
              ข้อกำหนดการใช้งาน
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}