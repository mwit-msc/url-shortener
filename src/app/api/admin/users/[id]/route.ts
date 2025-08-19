import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requireAdmin()
    const { role, linkLimit } = await request.json()

    // Validate role
    if (role && !Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    if (role) updateData.role = role
    if (linkLimit !== undefined) {
      updateData.linkLimit = role === UserRole.USER ? linkLimit : -1
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
