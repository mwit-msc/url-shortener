import { createHmac, timingSafeEqual } from "node:crypto"
import { deflateRawSync, inflateRawSync } from "node:zlib"

// Self-contained links carry their destination. These limits bound both the
// HTTP request and decompression work; they are independent of the database.
export const MAX_DIRECT_URL_BYTES = 4096
export const MAX_DIRECT_TOKEN_LENGTH = 5600
const SIGNING_CONTEXT = "mwit-tiny/direct-link/v1:"

export class DirectLinkError extends Error {}

function validateDestination(input: string): string {
  if (!input || Buffer.byteLength(input, "utf8") > MAX_DIRECT_URL_BYTES || /[\u0000-\u001f\u007f]/.test(input)) {
    throw new DirectLinkError("กรอก URL ไม่เกิน 4096 ไบต์ โดยไม่มีอักขระควบคุม")
  }
  let url: URL
  try {
    url = new URL(input.trim())
  } catch {
    throw new DirectLinkError("กรอก URL แบบเต็มที่ขึ้นต้นด้วย http:// หรือ https://")
  }
  if (!['http:', 'https:'].includes(url.protocol) || !url.hostname || url.username || url.password) {
    throw new DirectLinkError("ใช้ URL แบบ http:// หรือ https:// ที่ไม่มีชื่อผู้ใช้หรือรหัสผ่านใน URL")
  }
  // URL normalization can expand Unicode into percent-encoded bytes.
  if (Buffer.byteLength(url.href, "utf8") > MAX_DIRECT_URL_BYTES) {
    throw new DirectLinkError("URL ปลายทางยาวเกินไปสำหรับลิงก์แบบไม่บันทึก")
  }
  return url.href
}

function sign(body: string, secret: string): Buffer {
  if (!secret) throw new Error("Direct link signing is not configured")
  return createHmac("sha256", secret).update(SIGNING_CONTEXT).update(body).digest()
}

function decodeBase64Url(input: string): Buffer {
  if (!/^[A-Za-z0-9_-]+$/.test(input)) throw new DirectLinkError("ลิงก์แบบไม่บันทึกไม่ถูกต้อง")
  const bytes = Buffer.from(input, "base64url")
  if (bytes.toString("base64url") !== input) throw new DirectLinkError("ลิงก์แบบไม่บันทึกไม่ถูกต้อง")
  return bytes
}

export function encodeDirectLink(input: string, secret: string): { token: string; originalUrl: string } {
  const originalUrl = validateDestination(input)
  const raw = Buffer.from(originalUrl, "utf8")
  const compressed = deflateRawSync(raw)
  const useCompression = compressed.length < raw.length
  const payload = (useCompression ? compressed : raw).toString("base64url")
  const body = `${useCompression ? "v1d" : "v1r"}.${payload}`
  return { token: `${body}.${sign(body, secret).toString("base64url")}`, originalUrl }
}

export function decodeDirectLink(token: string, secret: string): string {
  if (token.length > MAX_DIRECT_TOKEN_LENGTH) throw new DirectLinkError("ลิงก์แบบไม่บันทึกไม่ถูกต้อง")
  const parts = token.split(".")
  if (parts.length !== 3) throw new DirectLinkError("ลิงก์แบบไม่บันทึกไม่ถูกต้อง")
  const [version, payload, signature] = parts
  if (version !== "v1r" && version !== "v1d") throw new DirectLinkError("ไม่รองรับรูปแบบของลิงก์นี้")
  const suppliedSignature = decodeBase64Url(signature)
  const expectedSignature = sign(`${version}.${payload}`, secret)
  if (suppliedSignature.length !== expectedSignature.length || !timingSafeEqual(suppliedSignature, expectedSignature)) {
    throw new DirectLinkError("ลิงก์ไม่ถูกต้องหรือการตั้งค่าสำหรับยืนยันลิงก์เปลี่ยนไป")
  }
  const bytes = decodeBase64Url(payload)
  try {
    const decoded = version === "v1d" ? inflateRawSync(bytes, { maxOutputLength: MAX_DIRECT_URL_BYTES }) : bytes
    const destination = new TextDecoder("utf-8", { fatal: true }).decode(decoded)
    return validateDestination(destination)
  } catch {
    throw new DirectLinkError("URL ปลายทางในลิงก์นี้ไม่ถูกต้อง")
  }
}

export function getDirectLinkSecret(): string | undefined {
  // A dedicated key lets deployments rotate auth credentials independently.
  // With either choice, the secret stays on the server and is never in a link.
  return process.env.DIRECT_LINK_SECRET || process.env.NEXTAUTH_SECRET
}
