import { NextResponse } from "next/server"
import { decodeDirectLink, getDirectLinkSecret } from "@/lib/direct-links"

export const runtime = "nodejs"

function unavailableResponse(status: number): NextResponse {
  // Static markup avoids reflecting an untrusted token or destination.
  return new NextResponse(`<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ลิงก์แบบไม่บันทึกใช้งานไม่ได้ · MWIT TINY</title><style>body{margin:0;background:#111;color:#f3f3f5;font:15px/1.7 system-ui,sans-serif;min-height:100svh;display:grid;place-items:center}main{box-sizing:border-box;width:min(440px,calc(100% - 40px));padding:32px;background:#232323;border:1px solid #363636;border-radius:18px}h1{font-size:24px;font-weight:600;margin:0 0 12px}p{color:#aaa7ae}a{color:#ff9ba9;text-underline-offset:4px}a:focus-visible{outline:2px solid #ff9ba9;outline-offset:4px}</style></head><body><main><h1>ลิงก์แบบไม่บันทึกใช้งานไม่ได้</h1><p>ลิงก์อาจไม่ครบถ้วน ถูกแก้ไข หรือการตั้งค่าสำหรับยืนยันลิงก์เปลี่ยนไป กรุณาขอลิงก์ใหม่จากผู้สร้าง</p><a href="/dashboard">กลับไปยัง MWIT TINY</a></main></body></html>`, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex" },
  })
}

async function resolve({ params }: { params: Promise<{ token: string }> }) {
  const secret = getDirectLinkSecret()
  if (!secret) return unavailableResponse(503)
  try {
    const { token } = await params
    const originalUrl = decodeDirectLink(token, secret)
    const response = NextResponse.redirect(originalUrl, 302)
    response.headers.set("Cache-Control", "no-store")
    response.headers.set("Referrer-Policy", "no-referrer")
    response.headers.set("X-Robots-Tag", "noindex")
    return response
  } catch {
    return unavailableResponse(400)
  }
}

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  return resolve(context)
}

export async function HEAD(_request: Request, context: { params: Promise<{ token: string }> }) {
  const response = await resolve(context)
  return new NextResponse(null, { status: response.status, headers: response.headers })
}
