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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>สร้างลิงก์สั้น</CardTitle>
          <CardDescription>
            {user.role === UserRole.USER && `คุณสามารถสร้างลิงก์ได้สูงสุด ${user.linkLimit} ลิงก์`}
            {user.role === UserRole.SPECIAL_USER && "คุณสามารถสร้างลิงก์ได้ไม่จำกัด"}
            {user.role === UserRole.ADMIN && "คุณมีสิทธิ์เข้าถึงฟีเจอร์ทั้งหมด"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="originalUrl">URL เดิม *</Label>
              <Input
                id="originalUrl"
                type="url"
                placeholder="https://example.com"
                value={originalUrl}
                onChange={(e) => setOriginalUrl(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">โดเมน *</Label>
              <Select value={selectedDomain} onValueChange={setSelectedDomain} required>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกโดเมน" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      {domain.domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="useCustom"
                checked={useCustom}
                onCheckedChange={setUseCustom}
                disabled={!canUseCustom && user.role === UserRole.USER}
              />
              <Label htmlFor="useCustom">
                ใช้รหัสสั้นแบบกำหนดเอง
                {!canUseCustom && user.role === UserRole.USER && " (ต้องได้รับการอนุมัติ)"}
              </Label>
            </div>

            {useCustom && (
              <div className="space-y-2">
                <Label htmlFor="customShortCode">รหัสสั้นแบบกำหนดเอง</Label>
                <Input
                  id="customShortCode"
                  placeholder="my-custom-link"
                  value={customShortCode}
                  onChange={(e) => setCustomShortCode(e.target.value)}
                  pattern="[a-zA-Z0-9_-]{3,20}"
                  title="3-20 ตัวอักษร ใช้ตัวอักษร ตัวเลข เครื่องหมายขีดกลาง และขีดล่างเท่านั้น"
                />
                {!canUseCustom && (
                  <Alert>
                    <AlertDescription>รหัสสั้นแบบกำหนดเองต้องได้รับการอนุมัติจากผู้ดูแลระบบสำหรับผู้ใช้ทั่วไป</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">หัวข้อ (ไม่บังคับ)</Label>
              <Input id="title" placeholder="หัวข้อลิงก์" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">คำอธิบาย (ไม่บังคับ)</Label>
              <Textarea
                id="description"
                placeholder="คำอธิบายลิงก์"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "กำลังสร้าง..." : "สร้างลิงก์สั้น"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && result.link && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              สร้างลิงก์สำเร็จ!
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <code className="flex-1 text-sm">{result.link.fullUrl}</code>
                <Button size="sm" variant="outline" onClick={() => result.link && copyToClipboard(result.link.fullUrl)} disabled={!result.link}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={result.link.fullUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">URL เดิม: {result.link.originalUrl}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {result && result.customRequest && (
        <Card>
          <CardHeader>
            <CardTitle>ส่งคำขอลิงก์กำหนดเองแล้ว</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
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

