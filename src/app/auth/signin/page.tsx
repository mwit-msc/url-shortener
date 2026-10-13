"use client"

import { signIn, getSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { GraduationCap, Link2, LoaderCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SignIn() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    getSession().then(session => { if (session) router.replace("/dashboard") }).catch(() => {})
  }, [router])

  const handleSignIn = async () => {
    setIsLoading(true)
    setError(false)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch {
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="signin-layout">
      <section className="signin-card" aria-labelledby="signin-title">
        <div className="signin-heading">
          <span className="signin-emblem" aria-hidden="true"><Link2 size={22} strokeWidth={1.8} /></span>
          <div>
            <h1 id="signin-title">เข้าสู่ระบบ</h1>
            <p>สร้างและจัดการลิงก์ย่อของคุณ</p>
          </div>
        </div>

        <div className="signin-actions">
          <Button
            variant="outline"
            size="lg"
            onClick={handleSignIn}
            disabled={isLoading}
            className="google-signin-button"
          >
            {isLoading ? <LoaderCircle className="size-5 animate-spin" /> : <Image src="/google-g.png" width={20} height={20} alt="" className="google-signin-icon" />}
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วย Google"}
          </Button>
          {error && <p role="alert" className="signin-error">เกิดข้อผิดพลาดระหว่างการยืนยันตัวตน</p>}
        </div>

        <div className="signin-account">
          <GraduationCap size={19} strokeWidth={1.7} aria-hidden="true" />
          <p>ใช้บัญชีโรงเรียน <strong>@mwit.ac.th</strong> เท่านั้น</p>
        </div>

        <nav className="signin-policy" aria-label="ข้อมูลการเข้าสู่ระบบ">
          <Link href="/tos">ข้อกำหนดการใช้บริการ</Link>
          <Link href="/privacy">นโยบายความเป็นส่วนตัว</Link>
        </nav>
      </section>
    </div>
  )
}
