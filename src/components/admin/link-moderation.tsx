"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, ExternalLink, Trash2, Trash } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Link {
  id: string
  shortCode: string
  originalUrl: string
  title?: string
  isActive: boolean
  clicks: number
  createdAt: string
  domain: {
    domain: string
  }
  user: {
    name?: string
    email: string
  }
}

export function LinkModeration() {
  const [links, setLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const fetchLinks = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/admin/links?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLinks(data.links)
        setTotalPages(data.pagination.pages)
      }
    } catch (error) {
      console.error("Error fetching links:", error)
    } finally {
      setIsLoading(false)
    }
  }, [page, searchTerm])

  const deactivateLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/admin/links/${linkId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: false }),
      })
      if (response.ok) {
        toast({
          title: "ลิงก์ถูกปิดใช้งาน",
          description: "ลิงก์ถูกปิดใช้งานเรียบร้อยแล้ว",
        })
        fetchLinks()
      } else {
        const data = await response.json()
        toast({
          title: "เกิดข้อผิดพลาด",
          description: data.error || "ไม่สามารถปิดใช้งานลิงก์ได้",
          variant: "destructive",
        })
      }
        } catch {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    }
  }

  const hardDeleteLink = async (linkId: string) => {
    try {
      const response = await fetch(`/api/admin/links/${linkId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        toast({
          title: "ลิงก์ถูกลบออกถาวร",
          description: "ลิงก์ถูกลบออกจากระบบเรียบร้อยแล้ว",
        })
        fetchLinks()
      } else {
        const data = await response.json()
        toast({
          title: "เกิดข้อผิดพลาด",
          description: data.error || "ไม่สามารถลบลิงก์ได้",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [page, searchTerm, fetchLinks])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">กำลังโหลดลิงก์...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>การกลั่นกรองลิงก์</CardTitle>
          <CardDescription>ตรวจสอบและกลั่นกรองลิงก์สั้นทั้งหมด</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ค้นหาลิงก์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {links.map((link) => (
        <Card key={link.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {link.domain.domain}/{link.shortCode}
                  </code>
                  {link.isActive ? (
                    <Badge variant="secondary">ใช้งานอยู่</Badge>
                  ) : (
                    <Badge variant="outline">ไม่ใช้งาน</Badge>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">→ {link.originalUrl}</p>

                {link.title && <p className="text-sm font-medium">{link.title}</p>}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>สร้างโดย {link.user.name || link.user.email}</span>
                  <span>{link.clicks} ครั้ง</span>
                  <span>สร้างเมื่อ {new Date(link.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a href={link.originalUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>

                {link.isActive && (
                  <Button size="sm" variant="outline" onClick={() => deactivateLink(link.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}

                {!link.isActive && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ลบลิงก์ถาวร</AlertDialogTitle>
                        <AlertDialogDescription>
                          การกระทำนี้ไม่สามารถยกเลิกได้ ลิงก์จะถูกลบออกจากระบบอย่างถาวรพร้อมกับข้อมูลสถิติทั้งหมด
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => hardDeleteLink(link.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          ลบถาวร
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
            ก่อนหน้า
          </Button>
          <span className="flex items-center px-4 text-sm">
            หน้า {page} จาก {totalPages}
          </span>
          <Button variant="outline" onClick={() => setPage(page + 1)} disabled={page === totalPages}>
            ถัดไป
          </Button>
        </div>
      )}
    </div>
  )
}
