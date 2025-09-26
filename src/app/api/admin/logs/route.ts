import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { getAdminLogs } from "@/lib/admin-logger"
import { AdminAction } from "@prisma/client"

export async function GET(request: Request) {
  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const adminId = searchParams.get('adminId') || undefined
    const action = searchParams.get('action') as AdminAction | undefined
    const entityType = searchParams.get('entityType') || undefined
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    let dateRange: { from: Date; to: Date } | undefined
    if (from && to) {
      dateRange = {
        from: new Date(from),
        to: new Date(to)
      }
    }

    const result = await getAdminLogs({
      page,
      limit,
      adminId,
      action,
      entityType,
      dateRange
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching admin logs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}