import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await requireAdmin()

    const [totalUsers, totalLinks, totalClicks, pendingRequests, activeUsers, recentLinks] = await Promise.all([
      prisma.user.count(),
      prisma.link.count(),
      prisma.link.aggregate({
        _sum: { clicks: true },
      }),
      prisma.customLinkRequest.count({
        where: { status: "PENDING" },
      }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      prisma.link.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ])

    return NextResponse.json({
      totalUsers,
      totalLinks,
      totalClicks: totalClicks._sum.clicks || 0,
      pendingRequests,
      activeUsers,
      recentLinks,
    })
  } catch (error) {
    console.error("Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
