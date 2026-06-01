import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole, AdminAction } from "@prisma/client"
import { logAdminActionWithHeaders } from "@/lib/admin-logger"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const admin = await requireAdmin()
    const { role, linkLimit } = await request.json()

    // Get current user data before update
    const currentUser = await prisma.user.findUnique({
      where: { id },
      select: { role: true, linkLimit: true, name: true, email: true }
    })

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Validate role
    if (role && !Object.values(UserRole).includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 })
    }

    const updateData: Record<string, unknown> = {}
    const changes: Record<string, unknown> = {}

    if (role && role !== currentUser.role) {
      updateData.role = role
      changes.previousRole = currentUser.role
      changes.newRole = role
    }

    // Derive the limit from the *effective* role (incoming role, else current),
    // so editing one field never silently corrupts the other.
    const effectiveRole = (role as UserRole) || currentUser.role
    const roleChangedToOrFromUser =
      role !== undefined && role !== currentUser.role
    if (linkLimit !== undefined || roleChangedToOrFromUser) {
      let newLinkLimit: number
      if (effectiveRole === UserRole.USER) {
        // Use provided limit; otherwise keep the existing one, or fall back to
        // the default (10) when the current value is the "unlimited" sentinel.
        newLinkLimit =
          linkLimit !== undefined
            ? linkLimit
            : currentUser.linkLimit >= 0
              ? currentUser.linkLimit
              : 10
      } else {
        // Non-USER roles are unlimited.
        newLinkLimit = -1
      }
      if (newLinkLimit !== currentUser.linkLimit) {
        updateData.linkLimit = newLinkLimit
        changes.previousLinkLimit = currentUser.linkLimit
        changes.newLinkLimit = newLinkLimit
      }
    }

    // Only update if there are actual changes
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(currentUser)
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    // Log admin actions
    if (changes.newRole) {
      await logAdminActionWithHeaders(
        admin.id,
        AdminAction.USER_ROLE_CHANGED,
        "user",
        id,
        {
          targetUser: { name: currentUser.name, email: currentUser.email },
          ...changes
        }
      )
    }

    if (changes.newLinkLimit !== undefined) {
      await logAdminActionWithHeaders(
        admin.id,
        AdminAction.USER_LIMIT_CHANGED,
        "user",
        id,
        {
          targetUser: { name: currentUser.name, email: currentUser.email },
          ...changes
        }
      )
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
