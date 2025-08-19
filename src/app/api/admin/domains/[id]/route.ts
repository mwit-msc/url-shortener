import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requireAdmin()
    const { isActive } = await request.json()

    const domain = await prisma.domain.update({
      where: { id },
      data: { isActive },
    })

    return NextResponse.json(domain)
  } catch (error) {
    console.error("Error updating domain:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requireAdmin()

    // Check if domain has any links
    const linkCount = await prisma.link.count({
      where: { domainId: id },
    })

    if (linkCount > 0) {
      return NextResponse.json({ error: "Cannot delete domain with existing links" }, { status: 400 })
    }

    await prisma.domain.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting domain:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
