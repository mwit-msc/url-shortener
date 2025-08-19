"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, Flag } from "lucide-react"

const reportTypes = {
  SPAM: "สแปมหรือเนื้อหาที่ไม่พึงประสงค์",
  MALWARE: "มัลแวร์หรือการหลอกลวงทางอินเทอร์เน็ต",
  ILLEGAL: "เนื้อหาที่ผิดกฎหมาย",
  COPYRIGHT: "การละเมิดลิขสิทธิ์",
  HARASSMENT: "การคุกคามหรือการล่วงละเมิด",
  ADULT_CONTENT: "เนื้อหาสำหรับผู้ใหญ่/ไม่เหมาะสม",
  SCAM: "การหลอกลวงหรือฉ้อโกง",
  OTHER: "อื่นๆ"
}

interface ReportAbuseFormProps {
  prefilledUrl?: string
  prefilledDomain?: string
  prefilledCode?: string
}

export function ReportAbuseForm({ prefilledUrl, prefilledDomain, prefilledCode }: ReportAbuseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    reportType: "",
    description: "",
    reporterEmail: "",
    linkUrl: prefilledUrl || "",
    customUrl: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Parse the URL to extract shortCode and domain if provided
      let shortCode = prefilledCode
      let domain = prefilledDomain
      
      if (!shortCode && (formData.linkUrl || formData.customUrl)) {
        const urlToProcess = formData.linkUrl || formData.customUrl
        try {
          const url = new URL(urlToProcess)
          domain = url.hostname
          shortCode = url.pathname.substring(1) // Remove leading slash
        } catch {
          // If URL parsing fails, we'll try to extract from the string
          const urlParts = (formData.linkUrl || formData.customUrl).split('/')
          if (urlParts.length >= 2) {
            domain = urlParts[urlParts.length - 2] || urlParts[0]
            shortCode = urlParts[urlParts.length - 1]
          }
        }
      }

      if (!shortCode || !domain) {
        setError("ไม่สามารถระบุลิงก์ที่ต้องการรายงานได้ กรุณาตรวจสอบ URL อีกครั้ง")
        setIsSubmitting(false)
        return
      }

      const response = await fetch("/api/public/report-abuse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shortCode,
          domain,
          reportType: formData.reportType,
          description: formData.description,
          reporterEmail: formData.reporterEmail
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({
          reportType: "",
          description: "",
          reporterEmail: "",
          linkUrl: "",
          customUrl: ""
        })
      } else {
        setError(data.error || "ไม่สามารถส่งรายงานได้")
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setIsSubmitted(false)
    setError("")
    setFormData({
      reportType: "",
      description: "",
      reporterEmail: "",
      linkUrl: prefilledUrl || "",
      customUrl: ""
    })
  }

  if (isSubmitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <div className="text-center">
              <h3 className="text-xl font-semibold">รายงานถูกส่งเรียบร้อยแล้ว</h3>
              <p className="text-muted-foreground mt-2">
                ขอบคุณที่ช่วยรักษาความปลอดภัยของบริการเรา ทีมงานจะตรวจสอบรายงานของคุณ
              </p>
              <Button onClick={resetForm} className="mt-4" variant="outline">
                รายงานเพิ่มเติม
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Flag className="w-6 h-6 text-red-500" />
          <div>
            <CardTitle>แบบฟอร์มรายงานการละเมิด</CardTitle>
            <CardDescription>
              กรอกข้อมูลด้านล่างเพื่อรายงานลิงก์ที่ไม่เหมาะสม
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Link URL Input */}
          {!prefilledUrl && !prefilledCode && (
            <div className="space-y-2">
              <Label htmlFor="customUrl">URL ที่ต้องการรายงาน *</Label>
              <Input
                id="customUrl"
                type="url"
                placeholder="https://example.com/abc123 หรือ example.com/abc123"
                value={formData.customUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, customUrl: e.target.value }))}
                required={!prefilledUrl && !prefilledCode}
              />
              <p className="text-xs text-muted-foreground">
                ใส่ลิงก์ย่อที่คุณต้องการรายงาน
              </p>
            </div>
          )}

          {/* Prefilled URL Display */}
          {(prefilledUrl || prefilledCode) && (
            <div className="bg-muted p-4 rounded-lg">
              <Label className="font-semibold">ลิงก์ที่ต้องการรายงาน:</Label>
              <p className="font-mono text-sm break-all mt-1">
                {prefilledDomain}/{prefilledCode}
              </p>
              {prefilledUrl && (
                <p className="text-sm text-muted-foreground mt-1 break-all">
                  → {prefilledUrl}
                </p>
              )}
            </div>
          )}

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="reportType">ประเภทการรายงาน *</Label>
            <Select 
              value={formData.reportType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, reportType: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="เลือกประเภทการรายงาน" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(reportTypes).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">รายละเอียดเพิ่มเติม</Label>
            <Textarea
              id="description"
              placeholder="กรุณาอธิบายเพิ่มเติมเกี่ยวกับปัญหาที่พบ (ไม่บังคับ)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              maxLength={1000}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/1000 ตัวอักษร
            </p>
          </div>

          {/* Reporter Email */}
          <div className="space-y-2">
            <Label htmlFor="reporterEmail">อีเมลของคุณ (ไม่บังคับ)</Label>
            <Input
              id="reporterEmail"
              type="email"
              placeholder="your@email.com"
              value={formData.reporterEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, reporterEmail: e.target.value }))}
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground">
              ไม่บังคับ เราอาจติดต่อคุณเพื่อขอข้อมูลเพิ่มเติม
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex gap-2">
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.reportType || (!prefilledCode && !formData.customUrl)}
              className="flex-1"
            >
              {isSubmitting ? "กำลังส่ง..." : "ส่งรายงาน"}
            </Button>
          </div>
        </form>

        {/* Information Section */}
        <div className="mt-8 pt-6 border-t space-y-4">
          <h4 className="font-semibold">สิ่งที่คุณสามารถรายงานได้</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• สแปมหรือเนื้อหาที่ไม่พึงประสงค์</li>
            <li>• มัลแวร์หรือการหลอกลวงทางอินเทอร์เน็ต</li>
            <li>• เนื้อหาที่ผิดกฎหมาย</li>
            <li>• การละเมิดลิขสิทธิ์</li>
            <li>• การคุกคามหรือการล่วงละเมิด</li>
            <li>• เนื้อหาสำหรับผู้ใหญ่/ไม่เหมาะสม</li>
            <li>• การหลอกลวงหรือฉ้อโกง</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            รายงานทั้งหมดจะได้รับการตรวจสอบโดยทีมควบคุมของเรา ขอบคุณที่ช่วยรักษาความปลอดภัยของบริการเรา
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
