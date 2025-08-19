import { type NextRequest, NextResponse } from "next/server"
import { getLinkByShortCode, incrementClickCount } from "@/lib/link-service"
import { headers } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: Promise<{ shortCode: string }> }) {
  try {
    const { shortCode } = await params
    const headersList = headers()
    const host = (await headersList).get("host") || ""
    const userAgent = (await headersList).get("user-agent") || ""
    const referer = (await headersList).get("referer") || ""

    // Get client IP (considering proxies)
    const forwarded = (await headersList).get("x-forwarded-for")
    const ipAddress = forwarded ? forwarded.split(",")[0] : (await headersList).get("x-real-ip") || ""

    const link = await getLinkByShortCode(shortCode, host)

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Record analytics and increment click count
    await incrementClickCount(link.id, {
      ipAddress: ipAddress ? hashIP(ipAddress) : undefined,
      userAgent,
      referer,
      // You can add geolocation data here if needed
    })

    // Redirect to original URL
    return NextResponse.redirect(link.originalUrl, 302)
  } catch (error) {
    console.error("Error redirecting:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Simple hash function for IP addresses (for privacy)
function hashIP(ip: string): string {
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}
