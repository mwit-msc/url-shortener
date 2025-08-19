import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { createLink } from "@/lib/link-service"
import { UserRole } from "@prisma/client"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const admin = await requireAdmin()
    const { action, adminNote } = await request.json()

    const customRequest = await prisma.customLinkRequest.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!customRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    if (action === "approve") {
      // Create the link
      const result = await createLink({
        originalUrl: customRequest.originalUrl,
        title: customRequest.title || undefined,
        description: customRequest.description || undefined,
        customShortCode: customRequest.shortCode,
        domainId: customRequest.domainId,
        userId: customRequest.userId,
        userRole: UserRole.ADMIN, // Use admin role to bypass restrictions
      })

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 })
      }

      // Update request status
      await prisma.customLinkRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          adminNote,
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      })
    } else if (action === "reject") {
      await prisma.customLinkRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          adminNote,
          reviewedBy: admin.id,
          reviewedAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error processing custom request:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
