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
    const acceptLanguage = headersList.get("accept-language") || ""

    // Extract primary language from Accept-Language header
    const language = acceptLanguage.split(',')[0]?.split(';')[0]?.trim() || undefined

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
              :root {
                --background: oklch(1 0 0);
                --foreground: oklch(0.145 0 0);
                --card: oklch(1 0 0);
                --card-foreground: oklch(0.145 0 0);
                --primary: oklch(0.205 0 0);
                --primary-foreground: oklch(0.985 0 0);
                --muted-foreground: oklch(0.556 0 0);
                --destructive: oklch(0.577 0.245 27.325);
                --border: oklch(0.922 0 0);
                --radius: 0.625rem;
              }
              
              @media (prefers-color-scheme: dark) {
                :root {
                  --background: oklch(0.145 0 0);
                  --foreground: oklch(0.985 0 0);
                  --card: oklch(0.205 0 0);
                  --card-foreground: oklch(0.985 0 0);
                  --primary: oklch(0.922 0 0);
                  --primary-foreground: oklch(0.205 0 0);
                  --muted-foreground: oklch(0.708 0 0);
                  --destructive: oklch(0.704 0.191 22.216);
                  --border: oklch(1 0 0 / 10%);
                }
              }
              
              * { margin: 0; padding: 0; box-sizing: border-box; }
              
              body { 
                font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                display: flex; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh; 
                background: var(--background);
                color: var(--foreground);
                padding: 1rem;
              }
              
              .container { 
                text-align: center; 
                max-width: 28rem;
                width: 100%;
                padding: 3rem 2rem;
                background: var(--card);
                color: var(--card-foreground);
                border-radius: var(--radius);
                border: 1px solid var(--border);
                box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
              }
              
              .icon {
                width: 4rem;
                height: 4rem;
                margin: 0 auto 1.5rem;
                color: var(--muted-foreground);
              }
              
              h1 { 
                font-size: 1.875rem;
                font-weight: 700;
                color: var(--destructive);
                margin-bottom: 1rem;
                line-height: 1.2;
              }
              
              p { 
                font-size: 1rem;
                margin-bottom: 2rem;
                color: var(--muted-foreground);
                line-height: 1.6;
              }
              
              .button-group {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
                align-items: center;
              }
              
              a { 
                display: inline-flex;
                align-items: center;
                justify-content: center;
                gap: 0.5rem;
                color: var(--primary-foreground);
                background: var(--primary);
                text-decoration: none; 
                padding: 0.75rem 1.5rem;
                border-radius: calc(var(--radius) - 2px);
                font-weight: 500;
                font-size: 0.875rem;
                transition: all 0.2s ease;
                min-width: 8rem;
              }
              
              a:hover { 
                opacity: 0.9;
                transform: translateY(-1px);
              }
              
              .secondary {
                background: transparent;
                color: var(--foreground);
                border: 1px solid var(--border);
              }
              
              .secondary:hover {
                background: var(--border);
              }
              
              @media (min-width: 640px) {
                .button-group {
                  flex-direction: row;
                }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
              </svg>
              <h1>ไม่พบลิงก์</h1>
              <p>ลิงก์สั้นที่คุณกำลังมองหาไม่มีอยู่หรือถูกลบไปแล้ว</p>
              <div class="button-group">
                <a href="/">กลับสู่หน้าหลัก</a>
                <a href="javascript:history.back()" class="secondary">ย้อนกลับ</a>
              </div>
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
      ipAddress: undefined, // Not collected for privacy
      userAgent,
      referer,
      language,
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
            :root {
              --background: oklch(1 0 0);
              --foreground: oklch(0.145 0 0);
              --card: oklch(1 0 0);
              --card-foreground: oklch(0.145 0 0);
              --primary: oklch(0.205 0 0);
              --primary-foreground: oklch(0.985 0 0);
              --muted-foreground: oklch(0.556 0 0);
              --destructive: oklch(0.577 0.245 27.325);
              --border: oklch(0.922 0 0);
              --radius: 0.625rem;
            }
            
            @media (prefers-color-scheme: dark) {
              :root {
                --background: oklch(0.145 0 0);
                --foreground: oklch(0.985 0 0);
                --card: oklch(0.205 0 0);
                --card-foreground: oklch(0.985 0 0);
                --primary: oklch(0.922 0 0);
                --primary-foreground: oklch(0.205 0 0);
                --muted-foreground: oklch(0.708 0 0);
                --destructive: oklch(0.704 0.191 22.216);
                --border: oklch(1 0 0 / 10%);
              }
            }
            
            * { margin: 0; padding: 0; box-sizing: border-box; }
            
            body { 
              font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex; 
              align-items: center; 
              justify-content: center; 
              min-height: 100vh; 
              background: var(--background);
              color: var(--foreground);
              padding: 1rem;
            }
            
            .container { 
              text-align: center; 
              max-width: 28rem;
              width: 100%;
              padding: 3rem 2rem;
              background: var(--card);
              color: var(--card-foreground);
              border-radius: var(--radius);
              border: 1px solid var(--border);
              box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            }
            
            .icon {
              width: 4rem;
              height: 4rem;
              margin: 0 auto 1.5rem;
              color: var(--muted-foreground);
            }
            
            h1 { 
              font-size: 1.875rem;
              font-weight: 700;
              color: var(--destructive);
              margin-bottom: 1rem;
              line-height: 1.2;
            }
            
            p { 
              font-size: 1rem;
              margin-bottom: 2rem;
              color: var(--muted-foreground);
              line-height: 1.6;
            }
            
            .button-group {
              display: flex;
              flex-direction: column;
              gap: 0.75rem;
              align-items: center;
            }
            
            a { 
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 0.5rem;
              color: var(--primary-foreground);
              background: var(--primary);
              text-decoration: none; 
              padding: 0.75rem 1.5rem;
              border-radius: calc(var(--radius) - 2px);
              font-weight: 500;
              font-size: 0.875rem;
              transition: all 0.2s ease;
              min-width: 8rem;
            }
            
            a:hover { 
              opacity: 0.9;
              transform: translateY(-1px);
            }
            
            .secondary {
              background: transparent;
              color: var(--foreground);
              border: 1px solid var(--border);
            }
            
            .secondary:hover {
              background: var(--border);
            }
            
            @media (min-width: 640px) {
              .button-group {
                flex-direction: row;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
            </svg>
            <h1>เกิดข้อผิดพลาด</h1>
            <p>เราพบข้อผิดพลาดขณะประมวลผลคำขอของคุณ</p>
            <div class="button-group">
              <a href="/">กลับสู่หน้าหลัก</a>
              <a href="javascript:history.back()" class="secondary">ย้อนกลับ</a>
            </div>
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

