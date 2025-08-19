import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

function hashIp(ip: string): string {
  return crypto.createHash("sha256").update(ip).digest("hex")
}

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIp = request.headers.get("x-real-ip")
  
  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }
  
  if (realIp) {
    return realIp.trim()
  }
  
  return null
}

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

    // Check for duplicate reports from the same IP in the last hour
    const clientIp = getClientIp(request)
    const hashedIp = clientIp ? hashIp(clientIp) : null
    
    if (hashedIp) {
      const recentReport = await prisma.abuseReport.findFirst({
        where: {
          linkId: link.id,
          reporterIp: hashedIp,
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000) // Last hour
          }
        }
      })

      if (recentReport) {
        return NextResponse.json({ error: "You have already reported this link recently" }, { status: 429 })
      }
    }

    // Rate limiting: max 5 reports per IP per day
    if (hashedIp) {
      const dailyReports = await prisma.abuseReport.count({
        where: {
          reporterIp: hashedIp,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })

      if (dailyReports >= 5) {
        return NextResponse.json({ error: "Daily report limit exceeded" }, { status: 429 })
      }
    }

    // Create the abuse report
    const abuseReport = await prisma.abuseReport.create({
      data: {
        linkId: link.id,
        reportType,
        description: description?.slice(0, 1000), // Limit description length
        reporterEmail: reporterEmail?.slice(0, 255), // Limit email length
        reporterIp: hashedIp,
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