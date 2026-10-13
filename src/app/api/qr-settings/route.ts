import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { getQrSettings } from "@/lib/qr-settings"

export async function GET() {
  try {
    if (!await getCurrentUser()) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    return NextResponse.json(await getQrSettings(), { headers: { "Cache-Control": "no-store" } })
  } catch {
    return NextResponse.json({ error: "โหลดการตั้งค่า QR ไม่สำเร็จ กรุณาตรวจสอบการเชื่อมต่อฐานข้อมูลและการอัปเดตโครงสร้างฐานข้อมูล" }, { status: 503 })
  }
}
