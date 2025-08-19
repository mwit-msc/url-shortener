import { type NextRequest, NextResponse } from "next/server"
import { getLinkByShortCode, incrementClickCount } from "@/lib/link-service"
import { headers } from "next/headers"

export async function GET(request: NextRequest, { params }: { params: Promise<{ shortCode: string }> }) {
  try {
    const { shortCode } = await params
    const headersList = await headers()
    
    // Auto-detect domain from HOST header
    const host = headersList.get("host") || ""
    const domain = host.split(':')[0] // Remove port if present
    
    if (!domain) {
      return NextResponse.json({ error: "Unable to determine domain" }, { status: 400 })
    }

    const userAgent = headersList.get("user-agent") || ""
    const referer = headersList.get("referer") || ""

    // Get client IP (considering proxies)
    const forwarded = headersList.get("x-forwarded-for")
    const ipAddress = forwarded ? forwarded.split(",")[0] : headersList.get("x-real-ip") || ""

    const link = await getLinkByShortCode(shortCode, domain)

    if (!link) {
      // Return a 404 page instead of JSON for better UX
      return new NextResponse(
        `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Link Not Found - MWIT TINY</title>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body { 
                font-family: system-ui, -apple-system, sans-serif; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh; 
                margin: 0; 
                background: #f8fafc;
                color: #334155;
              }
              .container { 
                text-align: center; 
                max-width: 400px; 
                padding: 2rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              h1 { color: #dc2626; margin-bottom: 1rem; }
              p { margin-bottom: 1.5rem; color: #64748b; }
              a { 
                color: #3b82f6; 
                text-decoration: none; 
                padding: 0.5rem 1rem;
                background: #eff6ff;
                border-radius: 4px;
                display: inline-block;
              }
              a:hover { background: #dbeafe; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Link Not Found</h1>
              <p>The short link you're looking for doesn't exist or has been removed.</p>
              <a href="/">Go to MWIT TINY</a>
            </div>
          </body>
        </html>
        `,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        },
      )
    }

    // Record analytics and increment click count
    await incrementClickCount(link.id, {
      ipAddress: ipAddress ? hashIP(ipAddress) : undefined,
      userAgent,
      referer,
      // You can add geolocation data here if needed
    })

    // Redirect to original URL
    return NextResponse.redirect(link.originalUrl, 302)
  } catch (error) {
    console.error("Error redirecting:", error)
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Error - MWIT TINY</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              margin: 0; 
              background: #f8fafc;
              color: #334155;
            }
            .container { 
              text-align: center; 
              max-width: 400px; 
              padding: 2rem;
              background: white;
              border-radius: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            h1 { color: #dc2626; margin-bottom: 1rem; }
            p { margin-bottom: 1.5rem; color: #64748b; }
            a { 
              color: #3b82f6; 
              text-decoration: none; 
              padding: 0.5rem 1rem;
              background: #eff6ff;
              border-radius: 4px;
              display: inline-block;
            }
            a:hover { background: #dbeafe; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Something went wrong</h1>
            <p>We encountered an error while processing your request.</p>
            <a href="/">Go to MWIT Link</a>
          </div>
        </body>
      </html>
      `,
      {
        status: 500,
        headers: { "Content-Type": "text/html" },
      },
    )
  }
}

// Simple hash function for IP addresses (for privacy)
function hashIP(ip: string): string {
  let hash = 0
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return hash.toString()
}
