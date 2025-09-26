import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { getLinkAnalytics } from "@/lib/analytics-service"
import { UserRole } from "@prisma/client"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ linkId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only SPECIAL_USER and ADMIN can access detailed analytics
    if (user.role === UserRole.USER) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const { linkId } = await params
    const { searchParams } = new URL(request.url)
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let dateRange: { from: Date; to: Date } | undefined
    if (from && to) {
      dateRange = {
        from: new Date(from),
        to: new Date(to)
      }
    }

    const analytics = await getLinkAnalytics(linkId, user.id, user.role, dateRange)

    if (!analytics) {
      return NextResponse.json({ error: "Link not found or insufficient permissions" }, { status: 404 })
    }

    return NextResponse.json(analytics)
  } catch (error) {
    console.error("Error fetching link analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}