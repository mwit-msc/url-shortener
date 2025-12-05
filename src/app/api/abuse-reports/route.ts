import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { prisma } from "../../../../prisma.config"
import { UserRole, AbuseReportStatus, AbuseReportType } from "@prisma/client"


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { linkId, reportType, description, reporterEmail } = body

    if (!linkId || !reportType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const validReportTypes = ["SPAM", "MALWARE", "ILLEGAL", "COPYRIGHT", "HARASSMENT", "ADULT_CONTENT", "SCAM", "OTHER"]
    if (!validReportTypes.includes(reportType)) {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    // Verify the link exists
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      include: { domain: true }
    })

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Note: IP-based rate limiting removed for privacy

    // Create the abuse report
    const abuseReport = await prisma.abuseReport.create({
      data: {
        linkId,
        reportType,
        description,
        reporterEmail,
        reporterIp: null,
      }
    })

    return NextResponse.json({ 
      message: "Report submitted successfully",
      reportId: abuseReport.id 
    })
  } catch (error) {
    console.error("Error creating abuse report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const status = searchParams.get("status") == "all" ? undefined : searchParams.get("status")
    const reportType = searchParams.get("reportType") == "all" ? undefined : searchParams.get("reportType")

    const where: { status?: AbuseReportStatus; reportType?: AbuseReportType } = {}
    if (status && Object.values(AbuseReportStatus).includes(status as AbuseReportStatus)) {
      where.status = status as AbuseReportStatus
    }
    if (reportType && Object.values(AbuseReportType).includes(reportType as AbuseReportType)) {
      where.reportType = reportType as AbuseReportType
    }

    const [reports, total] = await Promise.all([
      prisma.abuseReport.findMany({
        where,
        include: {
          link: {
            include: {
              domain: true,
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.abuseReport.count({ where })
    ])

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error("Error fetching abuse reports:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}