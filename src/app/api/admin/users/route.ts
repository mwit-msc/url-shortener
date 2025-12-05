import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { validateHost, createHostValidationResponse } from "@/lib/host-validation"

export async function GET(request: NextRequest) {
  if (!validateHost(request)) {
    return createHostValidationResponse()
  }
  try {
    await requireAdmin()

    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { links: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
