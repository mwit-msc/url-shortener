import { type NextRequest, NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth-utils"
import { createLink, getUserLinks } from "@/lib/link-service"

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { originalUrl, title, description, customShortCode, domainId, expiresAt } = body

    if (!originalUrl || !domainId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result = await createLink({
      originalUrl,
      title,
      description,
      customShortCode,
      domainId,
      userId: user.id,
      userRole: user.role,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error creating link:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const result = await getUserLinks(user.id, page, limit)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching links:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
