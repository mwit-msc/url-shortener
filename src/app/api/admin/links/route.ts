import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "../../../../../prisma.config"
import { validateHost, createHostValidationResponse } from "@/lib/host-validation"

export async function GET(request: NextRequest) {
  if (!validateHost(request)) {
    return createHostValidationResponse()
  }

  try {
    await requireAdmin()

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const search = searchParams.get("search")

    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (search) {
      where.OR = [
        { shortCode: { contains: search, mode: "insensitive" } },
        { originalUrl: { contains: search, mode: "insensitive" } },
        { title: { contains: search, mode: "insensitive" } },
      ]
    }

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        where,
        include: {
          domain: true,
          user: {
            select: { name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.link.count({ where }),
    ])

    return NextResponse.json({
      links,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching links:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
