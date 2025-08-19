import { NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function GET() {
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
