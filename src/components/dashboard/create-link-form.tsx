"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Copy, ExternalLink, CheckCircle } from "lucide-react"
import { UserRole } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"

interface CreateLinkFormProps {
  user: {
    id: string
    role: UserRole
    linkLimit: number
  }
}

interface Domain {
  id: string
  domain: string
}

interface LinkResult {
  link?: {
    fullUrl: string
    originalUrl: string
  }
  customRequest?: {
    id: string
  }
}

export function CreateLinkForm({ user }: CreateLinkFormProps) {
  const [originalUrl, setOriginalUrl] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [customShortCode, setCustomShortCode] = useState("")
  const [useCustom, setUseCustom] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState("")
  const [domains, setDomains] = useState<Domain[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<LinkResult | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchDomains()
  }, [])

  const fetchDomains = async () => {
    try {
      const response = await fetch("/api/domains")
      const data = await response.json()
      setDomains(data)
      if (data.length > 0) {
        setSelectedDomain(data[0].id)
      }
    } catch (error) {
      console.error("Error fetching domains:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalUrl,
          title: title || undefined,
          description: description || undefined,
          customShortCode: useCustom ? customShortCode : undefined,
          domainId: selectedDomain,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        // Reset form
        setOriginalUrl("")
        setTitle("")
        setDescription("")
        setCustomShortCode("")
        setUseCustom(false)

        if (data.link) {
          toast({
            title: "สร้างลิงก์สำเร็จ!",
            description: "ลิงก์สั้นของคุณพร้อมใช้งานแล้ว",
          })
        } else if (data.customRequest) {
          toast({
            title: "ส่งคำขอลิงก์กำหนดเองแล้ว",
            description: "คำขอของคุณกำลังรอการอนุมัติจากผู้ดูแลระบบ",
          })
        }
      } else {
        toast({
          title: "เกิดข้อผิดพลาด",
          description: data.error || "ไม่สามารถสร้างลิงก์ได้",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "คัดลอกแล้ว!",
      description: "คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว",
    })
  }

  const canUseCustom = user.role === UserRole.SPECIAL_USER || user.role === UserRole.ADMIN

  return (
    <div className="space-y-6 sm:space-y-8">
      <Card className="shadow-sm">
        <CardHeader className="space-y-3">
          <CardTitle className="text-xl sm:text-2xl">สร้างลิงก์สั้น</CardTitle>
          <CardDescription className="text-base sm:text-lg">
            {user.role === UserRole.USER && `คุณสามารถสร้างลิงก์ได้สูงสุด ${user.linkLimit} ลิงก์`}
            {user.role === UserRole.SPECIAL_USER && "คุณสามารถสร้างลิงก์ได้ไม่จำกัด"}
            {user.role === UserRole.ADMIN && "คุณมีสิทธิ์เข้าถึงฟีเจอร์ทั้งหมด"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Original URL Input */}
            <div className="space-y-3">
              <Label htmlFor="originalUrl" className="text-base font-medium">
                URL เดิม *
              </Label>
              <Input
                id="originalUrl"
                type="url"
                placeholder="https://example.com"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            {/* Domain Selection */}
            <div className="space-y-3">
              <Label htmlFor="domain" className="text-base font-medium">
                โดเมน *
              </Label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain} required>
                <SelectTrigger className="h-12 text-base">
                  <SelectValue placeholder="เลือกโดเมน" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id} className="text-base">
                      {domain.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Custom Short Code Toggle */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-4 border rounded-lg bg-muted/30">
                <Switch
                  id="useCustom"
                  checked={useCustom}
                  onCheckedChange={setUseCustom}
                  disabled={!canUseCustom && user.role === UserRole.USER}
                />
                <Label htmlFor="useCustom" className="text-base font-medium cursor-pointer">
                  ใช้รหัสสั้นแบบกำหนดเอง
                  {!canUseCustom && user.role === UserRole.USER && (
                    <span className="text-sm text-muted-foreground block">
                      (ต้องได้รับการอนุมัติ)
                    </span>
                  )}
                </Label>
              </div>

              {useCustom && (
                <div className="space-y-3">
                  <Label htmlFor="customShortCode" className="text-base font-medium">
                    รหัสสั้นแบบกำหนดเอง
                  </Label>
                  <Input
                    id="customShortCode"
                    placeholder="my-custom-link"
                    value={customShortCode}
                    onChange={(e) => setCustomShortCode(e.target.value)}
                    pattern="[a-zA-Z0-9_-]{3,20}"
                    title="3-20 ตัวอักษร ใช้ตัวอักษร ตัวเลข เครื่องหมายขีดกลาง และขีดล่างเท่านั้น"
                    className="h-12 text-base"
                  />
                  {!canUseCustom && (
                    <Alert className="border-amber-200 bg-amber-50">
                      <AlertDescription className="text-base">
                        รหัสสั้นแบบกำหนดเองต้องได้รับการอนุมัติจากผู้ดูแลระบบสำหรับผู้ใช้ทั่วไป
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </div>

            {/* Optional Fields */}
            <div className="space-y-6 pt-6 border-t">
              <h4 className="text-lg font-medium text-muted-foreground">ข้อมูลเพิ่มเติม (ไม่บังคับ)</h4>
              
              <div className="space-y-3">
                <Label htmlFor="title" className="text-base font-medium">
                  หัวข้อ
                </Label>
                <Input 
                  id="title" 
                  placeholder="หัวข้อสำหรับลิงก์นี้" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-12 text-base" 
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="description" className="text-base font-medium">
                  คำอธิบาย
                </Label>
                <Textarea
                  id="description"
                  placeholder="คำอธิบายเกี่ยวกับลิงก์นี้..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="text-base resize-none"
                />
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              {isLoading ? "กำลังสร้าง..." : "สร้างลิงก์สั้น"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Success Result */}
      {result && result.link && (
        <Card className="shadow-sm border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-green-700">
              <CheckCircle className="h-6 w-6" />
              <span className="text-xl">สร้างลิงก์สำเร็จ!</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
              <code className="flex-1 text-base font-mono break-all">{result.link.fullUrl}</code>
              <div className="flex gap-2 shrink-0">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => result.link && copyToClipboard(result.link.fullUrl)} 
                  disabled={!result.link}
                  className="h-9"
                >
                  <Copy className="h-4 w-4" />
                  <span className="hidden sm:inline ml-2">คัดลอก</span>
                </Button>
                <Button size="sm" variant="outline" asChild className="h-9">
                  <a href={result.link.fullUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">เปิด</span>
                  </a>
                </Button>
              </div>
            </div>
            <p className="text-base text-muted-foreground">
              <span className="font-medium">URL เดิม:</span> {result.link.originalUrl}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Custom Request Pending */}
      {result && result.customRequest && (
        <Card className="shadow-sm border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-xl text-amber-700">ส่งคำขอลิงก์กำหนดเองแล้ว</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert className="border-amber-200 bg-white">
              <AlertDescription className="text-base">
                คำขอรหัสสั้นแบบกำหนดเองของคุณได้ถูกส่งแล้วและกำลังรอการอนุมัติจากผู้ดูแลระบบ 
                คุณจะได้รับการแจ้งเตือนเมื่อได้รับการตรวจสอบแล้ว
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

