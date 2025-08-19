import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requireAdmin()
    const { isActive } = await request.json()

    const link = await prisma.link.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error("Error updating link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
