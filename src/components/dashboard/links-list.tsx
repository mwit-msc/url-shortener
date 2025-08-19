"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, Trash2 } from "lucide-react"
import type { UserRole } from "@prisma/client"
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

interface LinksListProps {
  userId: string
  userRole: UserRole
}

interface Link {
  id: string
  shortCode: string
  originalUrl: string
  title?: string
  description?: string
  isCustom: boolean
  clicks: number
  createdAt: string
  fullUrl: string
  domain: {
    domain: string
  }
}

export function LinksList({}: LinksListProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const fetchLinks = useCallback(async () => {
    try {
      const response = await fetch(`/api/links?page=${page}&limit=10`)
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
  }, [page])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
        title: "คัดลอกแล้ว!",
        description: "ลิงก์ถูกคัดลอกไปยังคลิปบอร์ด",
    })
  }

  const deleteLink = async (linkId: string, hardDelete = false) => {
    try {
      const url = `/api/links/${linkId}${hardDelete ? "?hard=true" : ""}`
      const response = await fetch(url, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
            title: "ลิงก์ถูกลบ",
            description: hardDelete ? "ลิงก์ถูกลบถาวรเรียบร้อยแล้ว." : "ลิงก์ถูกลบเรียบร้อยแล้ว.",
        })
        fetchLinks() // Refresh the list
      } else {
        const data = await response.json()
        toast({
            title: "ข้อผิดพลาด",
            description: data.error || "ไม่สามารถลบลิงก์ได้",
          variant: "destructive",
        })
      }
    } catch {
      toast({
          title: "ข้อผิดพลาด",
          description: "เกิดข้อผิดพลาดบางประการ กรุณาลองใหม่อีกครั้ง.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [page, fetchLinks])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
            <div className="text-center">กำลังโหลดลิงก์ของคุณ...</div>
        </CardContent>
      </Card>
    )
  }

  if (links.length === 0) {
    return (
      <Card>
        <CardHeader>
            <CardTitle>ลิงก์ของคุณ</CardTitle>
            <CardDescription>คุณยังไม่ได้สร้างลิงก์ใด ๆ</CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">สร้างลิงก์สั้นลิงก์แรกของคุณโดยใช้แบบฟอร์มด้านบน.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
            <CardTitle>ลิงก์ของคุณ</CardTitle>
            <CardDescription>จัดการและติดตามลิงก์สั้นของคุณ</CardDescription>
        </CardHeader>
      </Card>

      {links.map((link) => (
        <Card key={link.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{link.fullUrl}</code>
                  {link.isCustom && <Badge variant="secondary">Custom</Badge>}
                </div>

                <p className="text-sm text-muted-foreground">→ {link.originalUrl}</p>

                {link.title && <p className="text-sm font-medium">{link.title}</p>}

                {link.description && <p className="text-sm text-muted-foreground">{link.description}</p>}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{link.clicks} clicks</span>
                    <span>สร้างเมื่อ {new Date(link.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(link.fullUrl)}>
                  <Copy className="h-4 w-4" />
                </Button>

                <Button size="sm" variant="outline" asChild>
                  <a href={link.fullUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>ลบลิงก์</AlertDialogTitle>
                        <AlertDialogDescription>
                          เลือกวิธีการลบลิงก์นี้:
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteLink(link.id)} 
                        variant="outline"
                        className="bg-yellow-50 hover:bg-yellow-100 text-yellow-800 border-yellow-300"
                      >
                        ซ่อน (สามารถกู้คืนได้)
                      </AlertDialogAction>
                      <AlertDialogAction 
                        onClick={() => deleteLink(link.id, true)}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        ลบถาวร
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
