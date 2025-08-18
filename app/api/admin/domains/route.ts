import { type NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await requireAdmin()

    const domains = await prisma.domain.findMany({
      include: {
        _count: {
          select: { links: true },
        },
      },
      orderBy: { domain: "asc" },
    })

    return NextResponse.json(domains)
  } catch (error) {
    console.error("Error fetching domains:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const { domain } = await request.json()

    if (!domain || typeof domain !== "string") {
      return NextResponse.json({ error: "Domain is required" }, { status: 400 })
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/
    if (!domainRegex.test(domain)) {
      return NextResponse.json({ error: "Invalid domain format" }, { status: 400 })
    }

    const newDomain = await prisma.domain.create({
      data: {
        domain: domain.toLowerCase(),
        isActive: true,
      },
    })

    return NextResponse.json(newDomain)
  } catch (error) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "Domain already exists" }, { status: 400 })
    }
    console.error("Error creating domain:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
