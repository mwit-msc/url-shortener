"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, Link, Trash2 } from "lucide-react"
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
      <Card className="shadow-sm">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <div className="text-base sm:text-lg">กำลังโหลดลิงก์ของคุณ...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (links.length === 0) {
    return (
      <Card className="shadow-sm">
        <CardHeader className="text-center space-y-3">
          <CardTitle className="text-xl sm:text-2xl">ลิงก์ของคุณ</CardTitle>
          <CardDescription className="text-base sm:text-lg">
            คุณยังไม่ได้สร้างลิงก์ใด ๆ
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-base sm:text-lg text-muted-foreground max-w-md mx-auto">
            สร้างลิงก์สั้นลิงก์แรกของคุณโดยไปที่แท็บ &ldquo;สร้างลิงก์ใหม่&rdquo;
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header Card */}
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">ลิงก์ของคุณ</CardTitle>
          <CardDescription className="text-base sm:text-lg">
            จัดการและติดตามลิงก์สั้นของคุณ (ทั้งหมด {links.length} ลิงก์)
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Links Grid */}
      <div className="space-y-3 sm:space-y-4">
        {links.map((link) => (
          <Card key={link.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                {/* Link Information */}
                <div className="flex-1 space-y-3 min-w-0">
                  {/* Short URL and Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <code className="text-sm sm:text-base font-mono bg-muted px-3 py-2 rounded-lg break-all">
                      {link.fullUrl}
                    </code>
                    {link.isCustom && (
                      <Badge variant="secondary" className="text-xs sm:text-sm">
                        กำหนดเอง
                      </Badge>
                    )}
                  </div>

                  {/* Original URL */}
                  <div className="flex items-start gap-2">
                    <span className="text-sm sm:text-base text-muted-foreground shrink-0">→</span>
                    <p className="text-sm sm:text-base text-muted-foreground break-all">
                      {link.originalUrl}
                    </p>
                  </div>

                  {/* Title and Description */}
                  {link.title && (
                    <p className="text-sm sm:text-base font-medium text-primary">
                      {link.title}
                    </p>
                  )}

                  {link.description && (
                    <p className="text-sm sm:text-base text-muted-foreground">
                      {link.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-muted-foreground pt-2 border-t">
                    <div className="flex items-center gap-1">
                      <span className="font-medium text-primary">{link.clicks.toLocaleString()}</span>
                      <span>คลิก</span>
                    </div>
                    <span>•</span>
                    <span>สร้างเมื่อ {new Date(link.createdAt).toLocaleDateString('th-TH')}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => copyToClipboard(link.fullUrl)}
                    className="flex-1 lg:flex-none h-9"
                  >
                    <Copy className="h-4 w-4" />
                    <span className="ml-2 hidden sm:inline">คัดลอก</span>
                  </Button>

                  <Button size="sm" variant="outline" asChild className="flex-1 lg:flex-none h-9">
                    <a href={link.fullUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                      <span className="ml-2 hidden sm:inline">เปิด</span>
                    </a>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex-1 lg:flex-none h-9">
                        <Trash2 className="h-4 w-4" />
                        <span className="ml-2 hidden sm:inline">ลบ</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="sm:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg sm:text-xl">ลบลิงก์</AlertDialogTitle>
                        <AlertDialogDescription className="text-base">
                          เลือกวิธีการลบลิงก์นี้:
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="flex-col gap-3 sm:flex-row">
                        <AlertDialogCancel className="w-full sm:w-auto">ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteLink(link.id)} 
                          className="w-full sm:w-auto bg-amber-500 hover:bg-amber-600 text-white"
                        >
                          ซ่อน (สามารถกู้คืนได้)
                        </AlertDialogAction>
                        <AlertDialogAction 
                          onClick={() => deleteLink(link.id, true)}
                          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white"
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
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                variant="outline" 
                onClick={() => setPage(page - 1)} 
                disabled={page === 1}
                className="w-full sm:w-auto"
              >
                ← ก่อนหน้า
              </Button>
              <span className="flex items-center px-4 text-sm sm:text-base font-medium">
                หน้า {page} จาก {totalPages}
              </span>
              <Button 
                variant="outline" 
                onClick={() => setPage(page + 1)} 
                disabled={page === totalPages}
                className="w-full sm:w-auto"
              >
                ถัดไป →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
