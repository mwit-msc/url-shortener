import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const domains = await prisma.domain.findMany({
      where: { isActive: true },
      orderBy: { domain: "asc" },
    })

    return NextResponse.json(domains)
  } catch (error) {
    console.error("Error fetching domains:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
