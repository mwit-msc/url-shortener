import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { shortCode, domain, reportType, description, reporterEmail } = body

    if (!shortCode || !domain || !reportType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const validReportTypes = ["SPAM", "MALWARE", "ILLEGAL", "COPYRIGHT", "HARASSMENT", "ADULT_CONTENT", "SCAM", "OTHER"]
    if (!validReportTypes.includes(reportType)) {
      return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
    }

    // Find the link by shortCode and domain
    const domainRecord = await prisma.domain.findUnique({
      where: { domain }
    })

    if (!domainRecord) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 })
    }

    const link = await prisma.link.findUnique({
      where: {
        shortCode_domainId: {
          shortCode,
          domainId: domainRecord.id
        }
      }
    })

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 })
    }

    // Note: IP-based rate limiting removed for privacy

    // Create the abuse report
    const abuseReport = await prisma.abuseReport.create({
      data: {
        linkId: link.id,
        reportType,
        description: description?.slice(0, 1000), // Limit description length
        reporterEmail: reporterEmail?.slice(0, 255), // Limit email length
        reporterIp: null,
      }
    })

    return NextResponse.json({ 
      message: "Report submitted successfully. Thank you for helping keep our service safe.",
      reportId: abuseReport.id 
    })
  } catch (error) {
    console.error("Error creating public abuse report:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}