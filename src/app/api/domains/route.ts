import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "../../../../prisma.config"
import { DomainRestriction } from "@prisma/client"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const isAdmin = user.role === "ADMIN"

    // Build where clause based on user permissions
    const whereClause = { 
      isActive: true,
      OR: [
        { restriction: DomainRestriction.EVERYONE },
        ...(isAdmin ? [{ restriction: DomainRestriction.ADMIN_ONLY }] : []),
        {
          restriction: DomainRestriction.SPECIFIC_USERS,
          allowedUsers: {
            some: {
              userId: session.user.id
            }
          }
        }
      ]
    }

    const domains = await prisma.domain.findMany({
      where: whereClause,
      orderBy: { domain: "asc" },
      select: {
        id: true,
        domain: true,
        restriction: true
      }
    })

    return NextResponse.json(domains)
  } catch (error) {
    console.error("Error fetching domains:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
