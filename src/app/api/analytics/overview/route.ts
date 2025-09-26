import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { getUserAnalyticsOverview } from "@/lib/analytics-service"
import { UserRole } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only SPECIAL_USER and ADMIN can access detailed analytics
    if (user.role === UserRole.USER) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

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

    const overview = await getUserAnalyticsOverview(user.id, user.role, dateRange)

    if (!overview) {
      return NextResponse.json({ error: "Unable to fetch analytics" }, { status: 500 })
    }

    return NextResponse.json(overview)
  } catch (error) {
    console.error("Error fetching analytics overview:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}