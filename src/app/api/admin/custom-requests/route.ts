import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "../../../../../prisma.config"
import { validateHost, createHostValidationResponse } from "@/lib/host-validation"

export async function GET(request: NextRequest) {
  if (!validateHost(request)) {
    return createHostValidationResponse()
  }
  try {
    await requireAdmin()

    const requests = await prisma.customLinkRequest.findMany({
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching custom requests:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
