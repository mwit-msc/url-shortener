import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { getAdminAnalyticsOverview } from "@/lib/analytics-service"

export async function GET(request: Request) {
  try {
    const user = await requireAdmin()

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

    const overview = await getAdminAnalyticsOverview(user.role, dateRange)

    if (!overview) {
      return NextResponse.json({ error: "Unable to fetch admin analytics" }, { status: 500 })
    }

    return NextResponse.json(overview)
  } catch (error) {
    console.error("Error fetching admin analytics:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}