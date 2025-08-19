import { NextRequest, NextResponse } from "next/server"

function getAllowedHost(): string {
  const nextAuthUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  try {
    return new URL(nextAuthUrl).host
  } catch {
    return "localhost:3000"
  }
}

export function validateHost(request: NextRequest): boolean {
  const host = request.headers.get("host")
  const allowedHost = getAllowedHost()
  return host === allowedHost
}

export function createHostValidationResponse(): NextResponse {
  const allowedHost = getAllowedHost()
  return NextResponse.json(
    { 
      error: "Host access restricted", 
      message: `Admin and authentication functions are only available from ${allowedHost}`,
      allowedHost 
    },
    { status: 403 }
  )
}