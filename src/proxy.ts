import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

function getAllowedHost(): string {
  const nextAuthUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
  try {
    return new URL(nextAuthUrl).host
  } catch {
    return "localhost:3000"
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const host = request.headers.get('X-Forwarded-Host') || request.nextUrl.host
  const allowedHost = getAllowedHost()

  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  const restrictedRoutes = ["/dashboard", "/admin", "/auth"]
  const isRestrictedRoute = restrictedRoutes.some(route => pathname.startsWith(route))

  if (isRestrictedRoute && host !== allowedHost) {
    const url = request.nextUrl.clone()
    url.pathname = "/unauthorized"
    url.searchParams.set("reason", "host_restriction")
    url.searchParams.set("allowed_host", allowedHost)
    return NextResponse.redirect(url)
  }

  const shortCodeMatch = pathname.match(/^\/([a-zA-Z0-9_-]+)$/)

  if (shortCodeMatch && host) {
    const shortCode = shortCodeMatch[1]

    const knownRoutes = ["dashboard", "admin", "auth", "unauthorized", "api", "tos", "privacy", "report"]

    if (knownRoutes.includes(shortCode)) {
      return NextResponse.next()
    }

    const url = request.nextUrl.clone()
    url.pathname = `/api/redirect/${shortCode}`
    url.searchParams.set("domain", host)

    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
