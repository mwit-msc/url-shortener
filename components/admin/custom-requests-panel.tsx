"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Check, X, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface CustomRequest {
  id: string
  shortCode: string
  originalUrl: string
  title?: string
  description?: string
  status: string
  createdAt: string
  user: {
    name?: string
    email: string
  }
}

export function CustomRequestsPanel() {
  const [requests, setRequests] = useState<CustomRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [adminNote, setAdminNote] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/admin/custom-requests")
      const data = await response.json()

      if (response.ok) {
        setRequests(data)
      }
    } catch (error) {
      console.error("Error fetching requests:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRequest = async (requestId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/admin/custom-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action,
          adminNote: adminNote || undefined,
        }),
      })

      if (response.ok) {
        toast({
          title: `คำขอได้รับการ${action === "approve" ? "อนุมัติ" : "ปฏิเสธ"}`,
          description: `คำขอลิงก์ที่กำหนดเองได้รับการ${action === "approve" ? "อนุมัติ" : "ปฏิเสธ"}แล้ว`,
        })
        fetchRequests() // รีเฟรชรายการ
        setAdminNote("")
      } else {
        const data = await response.json()
        toast({
          title: "เกิดข้อผิดพลาด",
          description: data.error || `ไม่สามารถ${action === "approve" ? "อนุมัติ" : "ปฏิเสธ"}คำขอได้`,
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

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">กำลังโหลดคำขอที่กำหนดเอง...</div>
        </CardContent>
      </Card>
    )
  }

  const pendingRequests = requests.filter((req) => req.status === "PENDING")

  if (pendingRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>คำขอลิงก์ที่กำหนดเอง</CardTitle>
          <CardDescription>ไม่มีคำขอที่รอดำเนินการในขณะนี้</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">คำขอลิงก์ที่กำหนดเองทั้งหมดได้รับการดำเนินการแล้ว</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>คำขอลิงก์ที่กำหนดเอง</CardTitle>
          <CardDescription>{pendingRequests.length} คำขอที่รอดำเนินการ</CardDescription>
        </CardHeader>
      </Card>

      {pendingRequests.map((request) => (
        <Card key={request.id}>
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{request.shortCode}</code>
                  <Badge variant="outline">รอดำเนินการ</Badge>
                </div>

                <p className="text-sm text-muted-foreground">→ {request.originalUrl}</p>

                {request.title && <p className="text-sm font-medium">{request.title}</p>}

                {request.description && <p className="text-sm text-muted-foreground">{request.description}</p>}

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>ร้องขอโดย {request.user.name || request.user.email}</span>
                  <span>สร้างเมื่อ {new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" asChild>
                  <a href={request.originalUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setAdminNote("")
                      }}
                    >
                      ตรวจสอบ
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>ตรวจสอบคำขอลิงก์ที่กำหนดเอง</DialogTitle>
                      <DialogDescription>ตรวจสอบและอนุมัติหรือปฏิเสธคำขอรหัสลิงก์ที่กำหนดเองนี้</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label>รหัสย่อที่ร้องขอ</Label>
                        <code className="block text-sm font-mono bg-muted px-2 py-1 rounded mt-1">
                          {request.shortCode}
                        </code>
                      </div>

                      <div>
                        <Label>URL ต้นฉบับ</Label>
                        <p className="text-sm text-muted-foreground mt-1">{request.originalUrl}</p>
                      </div>

                      {request.title && (
                        <div>
                          <Label>ชื่อเรื่อง</Label>
                          <p className="text-sm mt-1">{request.title}</p>
                        </div>
                      )}

                      {request.description && (
                        <div>
                          <Label>คำอธิบาย</Label>
                          <p className="text-sm text-muted-foreground mt-1">{request.description}</p>
                        </div>
                      )}

                      <div>
                        <Label htmlFor="adminNote">Admin Note (optional)</Label>
                        <Textarea
                          id="adminNote"
                          placeholder="เพิ่มหมายเหตุสำหรับผู้ใช้..."
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          rows={3}
                        />
                      </div>
                    </div>

                    <DialogFooter className="gap-2">
                      <Button variant="outline" onClick={() => handleRequest(request.id, "reject")}>
                        <X className="h-4 w-4 mr-2" />
                        ปฏิเสธ
                      </Button>
                      <Button onClick={() => handleRequest(request.id, "approve")}>
                        <Check className="h-4 w-4 mr-2" />
                        อนุมัติ
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
