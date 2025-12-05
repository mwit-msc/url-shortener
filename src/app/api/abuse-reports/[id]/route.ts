import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"
import { UserRole } from "@prisma/client"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, adminNote } = body

    const validStatuses = ["PENDING", "INVESTIGATING", "RESOLVED", "DISMISSED"]
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const report = await prisma.abuseReport.findUnique({
      where: { id },
      include: { link: true }
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // Update the abuse report
    const updatedReport = await prisma.abuseReport.update({
      where: { id },
      data: {
        status,
        adminNote,
        reviewedBy: user.id,
        reviewedAt: new Date(),
      },
      include: {
        link: {
          include: {
            domain: true,
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    // If resolved and the report was valid, deactivate the link
    if (status === "RESOLVED" && report.link.isActive) {
      await prisma.link.update({
        where: { id: report.linkId },
        data: { isActive: false }
      })
    }

    return NextResponse.json(updatedReport)
  } catch (error) {
    console.error("Error updating abuse report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const report = await prisma.abuseReport.findUnique({
      where: { id },
      include: {
        link: {
          include: {
            domain: true,
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error("Error fetching abuse report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}