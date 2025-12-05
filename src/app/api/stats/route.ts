import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [totalLinks, totalClicks, activeLinks, pendingRequests] = await Promise.all([
      prisma.link.count({
        where: { userId: user.id },
      }),
      prisma.link.aggregate({
        where: { userId: user.id },
        _sum: { clicks: true },
      }),
      prisma.link.count({
        where: { userId: user.id, isActive: true },
      }),
      prisma.customLinkRequest.count({
        where: { userId: user.id, status: "PENDING" },
      }),
    ])

    return NextResponse.json({
      totalLinks,
      totalClicks: totalClicks._sum.clicks || 0,
      activeLinks,
      pendingRequests,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
