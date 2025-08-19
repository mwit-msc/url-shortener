import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { DomainRestriction } from "@prisma/client"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await requireAdmin()
    const { isActive, restriction, allowedUserIds } = await request.json()

    const updateData: {
      isActive?: boolean
      restriction?: DomainRestriction
    } = {}
    
    if (isActive !== undefined) {
      updateData.isActive = isActive
    }
    
    if (restriction !== undefined) {
      const validRestrictions: DomainRestriction[] = ["EVERYONE", "ADMIN_ONLY", "SPECIFIC_USERS"]
      if (!validRestrictions.includes(restriction as DomainRestriction)) {
        return NextResponse.json({ error: "Invalid restriction type" }, { status: 400 })
      }
      updateData.restriction = restriction as DomainRestriction
    }

    const domain = await prisma.domain.update({
      where: { id },
      data: updateData,
    })

    // Handle allowed users if restriction is SPECIFIC_USERS
    if (restriction === "SPECIFIC_USERS" && allowedUserIds) {
      // Clear existing allowed users
      await prisma.domainAllowedUser.deleteMany({
        where: { domainId: id }
      })

      // Add new allowed users
      if (allowedUserIds.length > 0) {
        await prisma.domainAllowedUser.createMany({
          data: allowedUserIds.map((userId: string) => ({
            domainId: id,
            userId: userId
          }))
        })
      }
    } else if (restriction && restriction !== "SPECIFIC_USERS") {
      // Clear allowed users if restriction is not SPECIFIC_USERS
      await prisma.domainAllowedUser.deleteMany({
        where: { domainId: id }
      })
    }

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
