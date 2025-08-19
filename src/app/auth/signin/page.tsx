"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/ui/theme-toggle"

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is already signed in
    getSession().then((session) => {
      if (session) {
        router.push("/dashboard")
      }
    })
  }, [router])

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Sign in error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">MWIT TINY</CardTitle>
          <CardDescription>
            เข้าสู่ระบบเพื่อสร้างและจัดการลิงก์สั้นของคุณ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn} disabled={isLoading} className="w-full" size="lg">
            {isLoading ? "Signing in..." : "Sign in with Google"}
          </Button>
          <p className="text-sm text-muted-foreground text-center mt-4">
            กรุณาเข้าสู่ระบบด้วยบัญชี @mwit.ac.th หรือ @mwit.link เท่านั้น
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
