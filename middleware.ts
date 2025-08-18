import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname, host } = request.nextUrl

  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  // Handle shortcode redirection for all domains
  // This will catch requests like tiny.mwit.link/abc123 or s.mwit.link/xyz789
  const shortCodeMatch = pathname.match(/^\/([a-zA-Z0-9_-]+)$/)

  if (shortCodeMatch && host) {
    const shortCode = shortCodeMatch[1]

    // Skip if it's a known route (not a shortcode)
    const knownRoutes = ["dashboard", "admin", "auth", "unauthorized", "api"]

    if (knownRoutes.includes(shortCode)) {
      return NextResponse.next()
    }

    // Rewrite to the shortcode handler with domain info
    const url = request.nextUrl.clone()
    url.pathname = `/api/redirect/${shortCode}`
    url.searchParams.set("domain", host)

    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
