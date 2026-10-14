import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { createHostValidationResponse, validateHost } from "@/lib/host-validation"
import { DirectLinkError, encodeDirectLink, getDirectLinkSecret } from "@/lib/direct-links"

export const runtime = "nodejs"

async function readBody(request: NextRequest): Promise<string | null> {
  if (Number(request.headers.get("content-length")) > 32768) return null
  if (!request.body) return ""
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let bytes = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      bytes += value.byteLength
      if (bytes > 32768) { await reader.cancel(); return null }
      chunks.push(value)
    }
    return Buffer.concat(chunks).toString("utf8")
  } finally { reader.releaseLock() }
}

export async function POST(request: NextRequest) {
  if (!validateHost(request)) return createHostValidationResponse()
  try {
    // Issuance uses the existing school-account authentication. Destinations
    // are never persisted; the public /d and /go routes have no auth or Prisma import.
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    const secret = getDirectLinkSecret()
    if (!secret) return NextResponse.json({ error: "ยังไม่ได้ตั้งค่าลิงก์แบบไม่บันทึก" }, { status: 503 })
    const body = await readBody(request)
    if (body === null) return NextResponse.json({ error: "ข้อมูลที่ส่งมายาวเกินไป" }, { status: 413 })
    let input: unknown
    try { input = JSON.parse(body) } catch {
      return NextResponse.json({ error: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 })
    }
    if (!input || typeof input !== "object" || !("originalUrl" in input) || typeof input.originalUrl !== "string") {
      return NextResponse.json({ error: "กรอก URL ปลายทาง" }, { status: 400 })
    }
    const { token, originalUrl } = encodeDirectLink(input.originalUrl, secret)
    const origin = new URL(process.env.NEXTAUTH_URL || request.url).origin
    return NextResponse.json({
      success: true,
      kind: "direct",
      link: { fullUrl: `${origin}/d/${token}`, originalUrl },
    }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    if (error instanceof DirectLinkError) return NextResponse.json({ error: error.message }, { status: 400 })
    console.error("Error creating direct link")
    return NextResponse.json({ error: "สร้างลิงก์แบบไม่บันทึกไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 })
  }
}
