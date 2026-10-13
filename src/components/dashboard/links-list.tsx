"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, ExternalLink, Link, Trash2, Plus, MousePointer2, ChevronLeft, ChevronRight } from "lucide-react"
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
  onCreate?: () => void
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

export function LinksList({ onCreate }: LinksListProps) {
  const [links, setLinks] = useState<Link[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const fetchLinks = useCallback(() => {
    return fetch(`/api/links?page=${page}&limit=10`)
      .then(async response => {
        const data = await response.json()
        if (response.ok) {
          setLinks(data.links)
          setTotalPages(data.pagination.pages)
        }
      })
      .catch(error => console.error("Error fetching links:", error))
      .finally(() => setIsLoading(false))
  }, [page])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: "คัดลอกแล้ว!", description: "ลิงก์ถูกคัดลอกไปยังคลิปบอร์ด" })
    } catch {
      toast({ title: "คัดลอกไม่สำเร็จ", description: "กรุณาคัดลอกลิงก์ด้วยตนเอง", variant: "destructive" })
    }
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
    return <Card><CardContent className="py-8 text-center"><div className="animate-spin rounded-full size-8 border-2 border-border border-t-primary mx-auto mb-3" /><p className="text-sm text-muted-foreground">กำลังโหลดลิงก์...</p></CardContent></Card>
  }

  if (links.length === 0) {
    return (
      <Card className="py-12 text-center">
        <CardHeader><div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground"><Link size={23} /></div><CardTitle>ลิงก์ของคุณ</CardTitle><CardDescription>คุณยังไม่ได้สร้างลิงก์ใด ๆ</CardDescription></CardHeader>
        <CardContent><Button onClick={onCreate}><Plus size={16} />สร้างลิงก์ใหม่</Button></CardContent>
      </Card>
    )
  }

  return (
    <Card className="gap-0 overflow-hidden pb-0">
      <CardHeader className="border-b pb-5">
        <div className="flex items-center justify-between gap-4">
          <div><CardTitle>ลิงก์ของคุณ</CardTitle><CardDescription className="mt-1">จัดการและติดตามลิงก์ย่อของคุณ</CardDescription></div>
          <Button onClick={onCreate} size="sm"><Plus size={15} /><span className="hidden sm:inline">สร้างลิงก์ใหม่</span><span className="sr-only sm:hidden">สร้างลิงก์ใหม่</span></Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {links.map(link => (
          <article key={link.id} className="link-list-row">
            <div className="link-row-mark"><Link size={19} /></div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium text-[var(--brand-ink)] break-all">{link.fullUrl}</p>{link.isCustom && <Badge variant="secondary" className="text-[10px]">กำหนดเอง</Badge>}</div>
              {link.title && <p className="text-sm mt-1">{link.title}</p>}
              <p className="text-xs text-muted-foreground break-all mt-1">{link.originalUrl}</p>
              {link.description && <p className="text-xs text-muted-foreground mt-1">{link.description}</p>}
              <div className="flex flex-wrap gap-4 mt-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-1"><MousePointer2 size={12} />{link.clicks.toLocaleString()} คลิก</span><span>สร้างเมื่อ {new Date(link.createdAt).toLocaleDateString('th-TH')}</span></div>
            </div>
            <div className="link-row-actions">
              <Button size="icon" variant="outline" onClick={() => copyToClipboard(link.fullUrl)} aria-label="คัดลอกลิงก์"><Copy size={15} /></Button>
              <Button size="icon" variant="outline" asChild><a href={link.fullUrl} target="_blank" rel="noopener noreferrer" aria-label="เปิดลิงก์"><ExternalLink size={15} /></a></Button>
              <AlertDialog>
                <AlertDialogTrigger asChild><Button size="icon" variant="ghost" className="text-muted-foreground hover:text-destructive" aria-label="ลบลิงก์"><Trash2 size={15} /></Button></AlertDialogTrigger>
                <AlertDialogContent className="sm:max-w-md">
                  <AlertDialogHeader><AlertDialogTitle>ลบลิงก์</AlertDialogTitle><AlertDialogDescription>เลือกวิธีการลบลิงก์นี้:</AlertDialogDescription></AlertDialogHeader>
                  <AlertDialogFooter className="flex-col gap-3 sm:flex-row sm:flex-wrap">
                    <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteLink(link.id)} className="bg-secondary text-secondary-foreground hover:bg-secondary/80">ซ่อน (สามารถกู้คืนได้)</AlertDialogAction>
                    <AlertDialogAction onClick={() => deleteLink(link.id, true)} className="bg-destructive text-white hover:bg-destructive/90">ลบถาวร</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </article>
        ))}
        {totalPages > 1 && <div className="flex items-center justify-between gap-3 px-6 py-4 border-t"><Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}><ChevronLeft size={15} />ก่อนหน้า</Button><span className="text-xs text-muted-foreground">หน้า {page} จาก {totalPages}</span><Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === totalPages}>ถัดไป<ChevronRight size={15} /></Button></div>}
      </CardContent>
    </Card>
  )
}
