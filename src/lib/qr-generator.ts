// Shared validation and query mapping for the QR generator integration.
export const QR_LOGOS = ["none", "alvis", "openhouse2025", "premwit2026", "openhouse2026"] as const
export const QR_STYLES = ["square", "dots", "rounded", "extra-rounded", "classy", "classy-rounded"] as const
export const QR_FONT_SIZES = ["small", "medium", "large"] as const
export const QR_ALIGNMENTS = ["left", "center", "right"] as const
export const QR_SIZES = ["400", "1024", "2048"] as const
export const QR_CAPTIONS = ["auto", "true", "false"] as const

export interface QrGeneratorSettings {
  enabled: boolean
  generatorUrl: string
  logo: typeof QR_LOGOS[number]
  style: typeof QR_STYLES[number]
  fontSize: typeof QR_FONT_SIZES[number]
  align: typeof QR_ALIGNMENTS[number]
  foreground: string
  background: string
  size: typeof QR_SIZES[number]
  caption: typeof QR_CAPTIONS[number]
}

export const DEFAULT_QR_SETTINGS: QrGeneratorSettings = {
  enabled: false, generatorUrl: "", logo: "alvis", style: "rounded",
  fontSize: "medium", align: "center", foreground: "0B1220", background: "FFFFFF",
  size: "400", caption: "auto",
}

export class QrSettingsError extends Error {}

function httpUrl(value: string): URL {
  let url: URL
  try { url = new URL(value) } catch { throw new QrSettingsError("กรอก URL แบบเต็มที่ขึ้นต้นด้วย http:// หรือ https://") }
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new QrSettingsError("ใช้ URL แบบ http:// หรือ https:// ที่ไม่มีชื่อผู้ใช้หรือรหัสผ่านใน URL")
  }
  return url
}

export function parseQrSettings(input: unknown): QrGeneratorSettings {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new QrSettingsError("รูปแบบการตั้งค่าไม่ถูกต้อง")
  const data = input as Record<string, unknown>
  if (typeof data.enabled !== "boolean" || typeof data.generatorUrl !== "string" || data.generatorUrl.length > 2048 || /[\u0000-\u001f\u007f]/.test(data.generatorUrl)) {
    throw new QrSettingsError("กรอกสถานะและ URL ของเครื่องมือสร้าง QR ให้ถูกต้อง")
  }
  const generatorUrl = data.generatorUrl.trim()
  if (generatorUrl) httpUrl(generatorUrl)
  else if (data.enabled) throw new QrSettingsError("กรอก URL ของเครื่องมือสร้าง QR ก่อนเปิดใช้งาน")

  const settings = { ...DEFAULT_QR_SETTINGS, enabled: data.enabled, generatorUrl }
  const options = { logo: QR_LOGOS, style: QR_STYLES, fontSize: QR_FONT_SIZES, align: QR_ALIGNMENTS, size: QR_SIZES, caption: QR_CAPTIONS }
  for (const [key, allowed] of Object.entries(options)) {
    const value = data[key] ?? DEFAULT_QR_SETTINGS[key as keyof typeof options]
    if (typeof value !== "string" || !(allowed as readonly string[]).includes(value)) throw new QrSettingsError(`ค่าของ ${key} ไม่ถูกต้อง`)
    Object.assign(settings, { [key]: value })
  }
  for (const key of ["foreground", "background"] as const) {
    const value = data[key] ?? DEFAULT_QR_SETTINGS[key]
    if (typeof value !== "string" || !/^#?[0-9a-fA-F]{6}$/.test(value)) throw new QrSettingsError("ระบุสีเป็นรหัสฐานสิบหก 6 หลัก เช่น D63850")
    settings[key] = value.replace(/^#/, "").toUpperCase()
  }
  return settings
}

// The receiving service limits UTF-16 input length. Do not split an emoji.
function captionText(value: string | undefined, limit: number): string {
  return (value || "").slice(0, limit).replace(/[\uD800-\uDBFF]$/, "")
}

export function buildQrGeneratorUrl(settings: QrGeneratorSettings, link: { fullUrl: string; title?: string; description?: string }): string | null {
  if (!settings.enabled) return null
  const config = parseQrSettings(settings)
  httpUrl(link.fullUrl)
  const url = httpUrl(config.generatorUrl)
  // Clear stale generator parameters but preserve unrelated service options.
  for (const key of ["link", "title", "description", "icon", "logo", "style", "fontSize", "align", "foreground", "background", "size", "caption"]) url.searchParams.delete(key)
  url.searchParams.set("link", link.fullUrl)
  url.searchParams.set("title", captionText(link.title, 80))
  url.searchParams.set("description", captionText(link.description, 120))
  for (const key of ["logo", "style", "fontSize", "align", "foreground", "background", "size"] as const) url.searchParams.set(key, config[key])
  if (config.caption !== "auto") url.searchParams.set("caption", config.caption)
  return url.href
}
