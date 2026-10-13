import { type NextRequest, NextResponse } from "next/server"
import { UserRole, AdminAction } from "@prisma/client"
import { getCurrentUser } from "@/lib/auth-utils"
import { validateHost, createHostValidationResponse } from "@/lib/host-validation"
import { prisma } from "@/lib/prisma"
import { logAdminActionWithHeaders } from "@/lib/admin-logger"
import { parseQrSettings, QrSettingsError } from "@/lib/qr-generator"

export async function PUT(request: NextRequest) {
  if (!validateHost(request)) return createHostValidationResponse()
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    if (user.role !== UserRole.ADMIN) return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้นที่แก้ไขการตั้งค่าได้" }, { status: 403 })
    let input: unknown
    try { input = await request.json() } catch { return NextResponse.json({ error: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 }) }
    const settings = parseQrSettings(input)
    const { enabled, generatorUrl, ...options } = settings
    await prisma.qrGeneratorConfig.upsert({ where: { id: "default" }, create: { id: "default", enabled, generatorUrl, options }, update: { enabled, generatorUrl, options } })
    await logAdminActionWithHeaders(user.id, AdminAction.SYSTEM_SETTINGS_CHANGED, "QrGeneratorConfig", "default", { enabled, generatorUrl, ...options })
    return NextResponse.json(settings, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    if (error instanceof QrSettingsError) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ error: "บันทึกการตั้งค่า QR ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูลและการอัปเดตโครงสร้างฐานข้อมูล" }, { status: 503 })
  }
}
