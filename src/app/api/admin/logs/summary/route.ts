import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { getAdminActivitySummary } from "@/lib/admin-logger"

export async function GET(request: Request) {
  try {
    await requireAdmin()

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

    const summary = await getAdminActivitySummary(dateRange)

    return NextResponse.json(summary)
  } catch (error) {
    console.error("Error fetching admin activity summary:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}