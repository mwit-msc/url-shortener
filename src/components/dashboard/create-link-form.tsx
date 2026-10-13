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
import { Copy, ExternalLink, CheckCircle, ChevronDown, Globe, Link2, LoaderCircle, Plus, ShieldCheck, Clock, QrCode } from "lucide-react"
import { UserRole } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
import { buildQrGeneratorUrl, parseQrSettings, type QrGeneratorSettings } from "@/lib/qr-generator"

interface CreateLinkFormProps {
  onCreated?: () => void
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
  kind?: "direct"
  link?: {
    fullUrl: string
    originalUrl: string
    title?: string
    description?: string
  }
  customRequest?: {
    id: string
  }
}

export function CreateLinkForm({ user, onCreated }: CreateLinkFormProps) {
  const [mode, setMode] = useState<"saved" | "direct">("saved")
  const [originalUrl, setOriginalUrl] = useState("")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [customShortCode, setCustomShortCode] = useState("")
  const [useCustom, setUseCustom] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState("")
  const [domains, setDomains] = useState<Domain[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<LinkResult | null>(null)
  const [qrSettings, setQrSettings] = useState<QrGeneratorSettings | null>(null)
  const { toast } = useToast()

  const fetchDomains = () => {
    return fetch("/api/domains")
      .then(async response => {
        if (!response.ok) throw new Error("Failed to fetch domains")
        const data: Domain[] = await response.json()
        setDomains(data)
        if (data.length > 0) setSelectedDomain(data[0].id)
      })
      .catch(error => console.error("Error fetching domains:", error))
  }

  useEffect(() => {
    fetchDomains()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/qr-settings", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        if (!response.ok) return
        setQrSettings(parseQrSettings(await response.json()))
      })
      .catch(() => {}) // Optional integration must not prevent link creation.
    return () => controller.abort()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch(mode === "direct" ? "/api/direct-links" : "/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mode === "direct" ? { originalUrl } : {
          originalUrl,
          title: title || undefined,
          description: description || undefined,
          customShortCode: useCustom ? customShortCode : undefined,
          domainId: selectedDomain,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data.link ? { ...data, link: { ...data.link, title: mode === "saved" ? title : undefined, description: mode === "saved" ? description : undefined } } : data)
        if (data.kind !== "direct") onCreated?.()
        // Reset form
        setOriginalUrl("")
        setTitle("")
        setDescription("")
        setCustomShortCode("")
        setUseCustom(false)

        if (data.link) {
          toast({
            title: "สร้างลิงก์สำเร็จ!",
            description: data.kind === "direct" ? "สร้างลิงก์แบบไม่บันทึกแล้ว ลิงก์นี้จะไม่อยู่ในรายการลิงก์ของคุณ" : "ลิงก์ย่อของคุณพร้อมใช้งานแล้ว",
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: "คัดลอกแล้ว!", description: "คัดลอกลิงก์ไปยังคลิปบอร์ดแล้ว" })
    } catch {
      toast({ title: "คัดลอกไม่สำเร็จ", description: "กรุณาคัดลอกลิงก์ด้วยตนเอง", variant: "destructive" })
    }
  }

  const canUseCustom = user.role === UserRole.SPECIAL_USER || user.role === UserRole.ADMIN

  const currentDomain = domains.find(domain => domain.id === selectedDomain)?.domain
  const previewUrl = result?.link?.fullUrl || (mode === "direct" ? "ลิงก์จะแสดงที่นี่หลังสร้าง" : `${currentDomain || "…"}/${useCustom && customShortCode ? customShortCode : "…"}`)
  const previewOriginal = result?.link?.originalUrl || originalUrl
  const qrUrl = qrSettings && result?.link ? buildQrGeneratorUrl(qrSettings, result.link) : null

  return (
    <div className="create-workspace">
      <Card className="form-panel gap-0">
        <CardHeader>
          <CardTitle className="panel-title"><Plus size={19} />สร้างลิงก์ใหม่</CardTitle>
          <CardDescription>{mode === "direct" ? "สร้างลิงก์ที่เก็บ URL ปลายทางไว้ในตัวลิงก์" : "กรอก URL เดิมและเลือกโดเมนสำหรับลิงก์ของคุณ"}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <fieldset className="creation-mode form-section" disabled={isLoading}>
              <legend>ประเภทลิงก์</legend>
              <div className="creation-mode-options">
                {([
                  { value: "saved", label: "ลิงก์ย่อแบบบันทึก", description: "บันทึกไว้ในบัญชีของคุณ" },
                  { value: "direct", label: "ลิงก์แบบไม่บันทึก", description: "ไม่เก็บข้อมูลปลายทางหรือสถิติการคลิก" },
                ] as const).map(option => (
                  <label key={option.value} className="mode-option">
                    <input type="radio" name="link-mode" value={option.value} checked={mode === option.value} onChange={() => { setMode(option.value); setResult(null) }} />
                    <span><strong>{option.label}</strong><small>{option.description}</small></span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="form-section">
              <Label htmlFor="originalUrl" className="field-label"><Link2 size={16} />URL เดิม <span className="text-primary">*</span></Label>
              <Input id="originalUrl" type="url" placeholder="https://example.com" value={originalUrl} onChange={e => setOriginalUrl(e.target.value)} required className="h-12" />
              <p className="field-help">ลิงก์ปลายทางที่ต้องการย่อ</p>
            </div>
            {mode === "saved" && <div className="form-section">
              <Label htmlFor="domain" className="field-label"><Globe size={16} />โดเมน <span className="text-primary">*</span></Label>
              <Select value={selectedDomain} onValueChange={value => { if (value) setSelectedDomain(value) }} required>
                <SelectTrigger id="domain" className="w-full h-11"><SelectValue placeholder="เลือกโดเมน" /></SelectTrigger>
                <SelectContent>{domains.map(domain => <SelectItem key={domain.id} value={domain.id}>{domain.domain}</SelectItem>)}</SelectContent>
              </Select>
              <div className="custom-toggle">
                <div>
                  <Label htmlFor="useCustom" className="text-sm cursor-pointer">ใช้รหัสสั้นแบบกำหนดเอง</Label>
                  <p className="field-help mt-1">{canUseCustom ? "กำหนดรหัสสั้นของคุณเอง" : "ต้องได้รับการอนุมัติ"}</p>
                </div>
                <Switch id="useCustom" checked={useCustom} onCheckedChange={setUseCustom} disabled={!canUseCustom && user.role === UserRole.USER} />
              </div>
              {useCustom && (
                <div className="mt-4">
                  <Label htmlFor="customShortCode" className="field-label">รหัสสั้นแบบกำหนดเอง</Label>
                  <Input id="customShortCode" placeholder="my-custom-link" value={customShortCode} onChange={e => setCustomShortCode(e.target.value)} pattern="[a-zA-Z0-9_\-]{3,20}" title="3-20 ตัวอักษร ใช้ตัวอักษร ตัวเลข เครื่องหมายขีดกลาง และขีดล่างเท่านั้น" />
                  <p className="field-help">3–20 ตัวอักษร ใช้ตัวอักษร ตัวเลข ขีดกลาง และขีดล่าง</p>
                  {!canUseCustom && <Alert className="status-warning mt-3"><AlertDescription>รหัสสั้นแบบกำหนดเองต้องได้รับการอนุมัติจากผู้ดูแลระบบสำหรับผู้ใช้ทั่วไป</AlertDescription></Alert>}
                </div>
              )}
            </div>}
            {mode === "direct" && <div className="direct-info">
              <strong>ลิงก์ที่เก็บปลายทางไว้ในตัว</strong>
              <p>URL ปลายทางจะถูกแปลงเป็นรหัสและเก็บไว้ในลิงก์ จึงอาจยาวกว่า URL เดิม ผู้ที่มีลิงก์สามารถถอดกลับเป็น URL ปลายทางได้ ข้อมูลนี้ไม่ได้ถูกเข้ารหัสลับ</p>
              <p>ลิงก์นี้จะไม่อยู่ในรายการลิงก์ของคุณ ไม่มีสถิติการคลิก และไม่สามารถกำหนดรหัสสั้นหรือยกเลิกเป็นรายลิงก์ได้</p>
            </div>}
            {mode === "saved" && <details className="optional-fields">
              <summary>ข้อมูลเพิ่มเติม (ไม่บังคับ)<ChevronDown size={16} /></summary>
              <div className="space-y-4">
                <div><Label htmlFor="title" className="field-label">หัวข้อ</Label><Input id="title" placeholder="หัวข้อสำหรับลิงก์นี้" value={title} onChange={e => setTitle(e.target.value)} /></div>
                <div><Label htmlFor="description" className="field-label">คำอธิบาย</Label><Textarea id="description" placeholder="คำอธิบายเกี่ยวกับลิงก์นี้..." value={description} onChange={e => setDescription(e.target.value)} rows={3} /></div>
              </div>
            </details>}
            <div className="form-submit">
              <Button type="submit" disabled={isLoading || (mode === "saved" && !selectedDomain)} className="w-full" size="lg">{isLoading ? <LoaderCircle size={17} className="animate-spin" /> : <Plus size={17} />}{isLoading ? "กำลังสร้าง..." : mode === "direct" ? "สร้างลิงก์แบบไม่บันทึก" : "สร้างลิงก์ย่อ"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="preview-column">
        <Card className="link-preview" aria-live="polite">
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-3">{result?.link ? "สร้างลิงก์สำเร็จ!" : mode === "direct" ? "ลิงก์แบบไม่บันทึก" : "ตัวอย่างลิงก์ย่อ"}{result?.link && <CheckCircle size={18} className="text-[var(--success)]" />}</CardTitle>
            <CardDescription>{result?.kind === "direct" ? "พร้อมแชร์ · ไม่บันทึกในบัญชี" : result?.link ? "ลิงก์ย่อของคุณพร้อมใช้งานแล้ว" : mode === "direct" ? "URL ปลายทางจะถูกเก็บไว้ในตัวลิงก์" : "ดูตัวอย่างก่อนสร้างลิงก์"}</CardDescription>
          </CardHeader>
          <div className="preview-stage">
            <div className="link-paper">
              <span className="link-paper-icon"><Link2 size={20} /></span>
              <p className="preview-url">{previewUrl}</p>
              <p className="preview-original">{previewOriginal || "https://example.com"}</p>
            </div>
            <p className="preview-caption"><Link2 size={12} />{result?.link ? "พร้อมแชร์" : mode === "direct" ? "ลิงก์แบบไม่บันทึกอาจยาวกว่า URL เดิม" : "รหัสสั้นจะถูกสร้างเมื่อคุณกดสร้างลิงก์"}</p>
          </div>
          <div className="preview-actions">
            {result?.kind === "direct" && result.link && <p className="link-length">ความยาว {result.link.fullUrl.length} ตัวอักษร · URL เดิม {result.link.originalUrl.length} ตัวอักษร ลิงก์นี้จะไม่อยู่ในรายการลิงก์ของคุณ</p>}
            {result?.link ? (
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => result.link && copyToClipboard(result.link.fullUrl)}><Copy size={16} />คัดลอก</Button>
                <Button variant="outline" asChild><a href={result.link.fullUrl} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} />เปิด</a></Button>
                {qrUrl && <Button variant="outline" asChild className="col-span-2"><a href={qrUrl} target="_blank" rel="noopener noreferrer"><QrCode size={16} />แสดง QR</a></Button>}
              </div>
            ) : result?.customRequest ? (
              <Alert className="status-warning"><Clock size={16} /><AlertDescription>ส่งคำขอลิงก์กำหนดเองแล้ว คำขอของคุณกำลังรอการอนุมัติจากผู้ดูแลระบบ</AlertDescription></Alert>
            ) : <p className="text-xs text-muted-foreground">กรอกข้อมูลแล้วกดสร้างลิงก์ย่อ จากนั้นคัดลอกลิงก์เพื่อแชร์</p>}
          </div>
        </Card>
        <Card className="account-card gap-3">
          <CardHeader><CardTitle className="panel-title text-base"><ShieldCheck size={17} />ข้อมูลบัญชี</CardTitle></CardHeader>
          <CardContent>
            <dl className="account-details">
              <div><dt>บทบาท</dt><dd>{user.role === UserRole.ADMIN ? "ผู้ดูแลระบบ" : user.role === UserRole.SPECIAL_USER ? "ผู้ใช้พิเศษ" : "ผู้ใช้ทั่วไป"}</dd></div>
              <div><dt>ขีดจำกัดลิงก์</dt><dd>{user.role === UserRole.USER ? `${user.linkLimit} ลิงก์` : "ไม่จำกัด"}</dd></div>
              <div><dt>URL ที่กำหนดเอง</dt><dd>{user.role === UserRole.USER ? "ต้องได้รับอนุมัติ" : "ใช้ได้ทันที"}</dd></div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
