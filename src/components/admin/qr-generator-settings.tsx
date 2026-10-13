"use client"

import { useEffect, useState, type FormEvent } from "react"
import { QrCode, LoaderCircle } from "lucide-react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { DEFAULT_QR_SETTINGS, parseQrSettings, type QrGeneratorSettings } from "@/lib/qr-generator"
import { useToast } from "@/hooks/use-toast"

const choices = {
  logo: [["none", "ไม่ใช้โลโก้"], ["alvis", "Alvis"], ["openhouse2025", "Open House 2025"], ["premwit2026", "Pre-MWIT 2026"], ["openhouse2026", "Open House 2026"]],
  style: [["square", "สี่เหลี่ยม"], ["dots", "จุด"], ["rounded", "มุมมน"], ["extra-rounded", "มุมมนมาก"], ["classy", "ลายตกแต่ง"], ["classy-rounded", "ลายตกแต่งมุมมน"]],
  fontSize: [["small", "เล็ก"], ["medium", "กลาง"], ["large", "ใหญ่"]],
  align: [["left", "ซ้าย"], ["center", "กึ่งกลาง"], ["right", "ขวา"]],
  size: [["400", "400 × 400 พิกเซล"], ["1024", "1024 × 1024 พิกเซล"], ["2048", "2048 × 2048 พิกเซล"]],
  caption: [["auto", "แสดงเมื่อมีหัวข้อหรือคำอธิบาย"], ["true", "แสดงเสมอ"], ["false", "ซ่อน"]],
} as const
const labels = { logo: "โลโก้", style: "รูปแบบ QR", fontSize: "ขนาดข้อความ", align: "การจัดข้อความ", size: "ขนาดภาพ", caption: "ข้อความใต้ QR" }

export function QrGeneratorSettingsPanel() {
  const [settings, setSettings] = useState<QrGeneratorSettings>({ ...DEFAULT_QR_SETTINGS })
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const controller = new AbortController()
    fetch("/api/qr-settings", { cache: "no-store", signal: controller.signal })
      .then(async response => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "โหลดการตั้งค่าไม่สำเร็จ")
        setSettings(parseQrSettings(data))
      })
      .catch(error => { if (!controller.signal.aborted) setLoadError(error.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [])

  async function save(event: FormEvent) {
    event.preventDefault()
    setSaving(true)
    try {
      const validated = parseQrSettings(settings)
      const response = await fetch("/api/admin/qr-settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(validated) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "บันทึกการตั้งค่าไม่สำเร็จ")
      setSettings(parseQrSettings(data))
      toast({ title: "บันทึกการตั้งค่า QR แล้ว" })
    } catch (error) {
      toast({ title: "บันทึกไม่สำเร็จ", description: error instanceof Error ? error.message : "กรุณาลองใหม่", variant: "destructive" })
    } finally { setSaving(false) }
  }

  return <Card>
    <CardHeader>
      <CardTitle className="panel-title"><QrCode size={19} />เครื่องมือสร้าง QR</CardTitle>
      <CardDescription>เพิ่มปุ่ม “แสดง QR” หลังสร้างลิงก์ เพื่อเปิดเครื่องมือสร้าง QR พร้อมข้อมูลลิงก์</CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? <p className="text-sm text-muted-foreground">กำลังโหลดการตั้งค่า...</p> : loadError ? <p role="alert" className="text-sm text-destructive">{loadError}</p> : <form onSubmit={save} className="space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div><Label htmlFor="qr-enabled">เปิดใช้งานเครื่องมือสร้าง QR</Label><p className="field-help mt-1">ใช้ได้กับลิงก์ย่อแบบบันทึกและลิงก์แบบไม่บันทึก</p></div>
          <Switch id="qr-enabled" checked={settings.enabled} disabled={saving} onCheckedChange={enabled => setSettings(current => ({ ...current, enabled }))} />
        </div>
        <div className="space-y-2"><Label htmlFor="qr-generator-url">URL ของเครื่องมือสร้าง QR</Label><Input id="qr-generator-url" type="url" placeholder="https://qr.example.com/" maxLength={2048} required={settings.enabled} disabled={saving} value={settings.generatorUrl} onChange={event => setSettings(current => ({ ...current, generatorUrl: event.target.value }))} /><p className="field-help">ระบุหน้าเครื่องมือสร้าง QR ระบบจะเติมลิงก์และตัวเลือกให้โดยอัตโนมัติ</p></div>
        <fieldset disabled={saving} className="space-y-3">
          <legend className="text-sm font-medium mb-3">รูปแบบ QR เริ่มต้น</legend>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(Object.keys(choices) as (keyof typeof choices)[]).map(key => <div key={key} className="space-y-2">
              <Label htmlFor={`qr-${key}`}>{labels[key]}</Label>
              <select id={`qr-${key}`} className="flex h-11 w-full min-w-0 rounded-lg border bg-[var(--field)] px-3 text-sm focus-visible:outline-2 focus-visible:outline-ring" value={settings[key]} onChange={event => setSettings(current => ({ ...current, [key]: event.target.value }))}>
                {choices[key].map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </div>)}
            {([['foreground', 'สี QR'], ['background', 'สีพื้นหลัง']] as const).map(([key, label]) => <div key={key} className="space-y-2"><Label htmlFor={`qr-${key}`}>{label}</Label><Input id={`qr-${key}`} value={settings[key]} onChange={event => setSettings(current => ({ ...current, [key]: event.target.value }))} pattern="#?[0-9a-fA-F]{6}" maxLength={7} required placeholder="D63850" /><p className="field-help">รหัสสี 6 หลัก เช่น D63850</p></div>)}
          </div>
        </fieldset>
        <p className="field-help">หัวข้อและคำอธิบายของลิงก์จะส่งเป็นข้อความใต้ QR โดยจำกัดที่ 80 และ 120 ตัวอักษร</p>
        <Button type="submit" disabled={saving}>{saving && <LoaderCircle size={16} className="animate-spin" />}{saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า QR"}</Button>
      </form>}
    </CardContent>
  </Card>
}
