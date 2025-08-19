import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import Link from "next/link"
import { Suspense } from "react"

function UnauthorizedContent() {
  if (typeof window !== "undefined") {
    const urlParams = new URLSearchParams(window.location.search)
    const reason = urlParams.get("reason")
    const allowedHost = urlParams.get("allowed_host")

    if (reason === "host_restriction" && allowedHost) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="absolute top-4 right-4">
            <ThemeToggle />
          </div>
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-destructive">Host Access Restricted</CardTitle>
              <CardDescription>Login and administrative functions are restricted to the authorized domain.</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                Please access this site from <span className="font-mono font-medium">{allowedHost}</span> to use login and administrative features.
              </p>
              <p className="text-xs text-muted-foreground">
                Short link redirects continue to work from any domain.
              </p>
              <div className="flex gap-2 justify-center">
                <Button asChild>
                  <Link href={`https://${allowedHost}`}>Go to {allowedHost}</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-destructive">Access Denied</CardTitle>
          <CardDescription>You don&apos;t have permission to access this resource.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">Contact an administrator if you believe this is an error.</p>
          <div className="flex gap-2 justify-center">
            <Button asChild variant="outline">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild>
              <Link href="/">Home</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Unauthorized() {
  return (
    <Suspense fallback={<UnauthorizedContent />}>
      <UnauthorizedContent />
    </Suspense>
  )
}
