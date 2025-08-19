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

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requireAdmin()

    const link = await prisma.link.findUnique({
      where: { id },
      select: { isActive: true }
    })

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    if (link.isActive) {
      return NextResponse.json({ error: "Cannot delete active links. Deactivate first." }, { status: 400 })
    }

    await prisma.link.delete({
      where: { id }
    })

    return NextResponse.json({ message: "Link permanently deleted" })
  } catch (error) {
    console.error("Error deleting link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
