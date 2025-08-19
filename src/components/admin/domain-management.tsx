"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"
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

interface Domain {
  id: string
  domain: string
  isActive: boolean
  createdAt: string
  _count: {
    links: number
  }
}

export function DomainManagement() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newDomain, setNewDomain] = useState("")
  const [isAddingDomain, setIsAddingDomain] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchDomains()
  }, [])

  const fetchDomains = async () => {
    try {
      const response = await fetch("/api/admin/domains")
      const data = await response.json()

      if (response.ok) {
        setDomains(data)
      }
    } catch {
      console.error("Error fetching domains")
    } finally {
      setIsLoading(false)
    }
  }

  const addDomain = async () => {
    if (!newDomain.trim()) return

    setIsAddingDomain(true)
    try {
      const response = await fetch("/api/admin/domains", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: newDomain.trim() }),
      })

      if (response.ok) {
        toast({
          title: "Domain added",
          description: "New domain has been successfully added.",
        })
        setNewDomain("")
        fetchDomains()
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to add domain",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAddingDomain(false)
    }
  }

  const toggleDomainStatus = async (domainId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/domains/${domainId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive }),
      })

      if (response.ok) {
        toast({
          title: "อัปเดตโดเมนสำเร็จ",
          description: `โดเมนได้ถูก${isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}เรียบร้อยแล้ว.`,
        })
        fetchDomains()
      } else {
        const data = await response.json()
        toast({
          title: "เกิดข้อผิดพลาด",
          description: data.error || "ไม่สามารถอัปเดตโดเมนได้",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "เกิดข้อผิดพลาด",
        description: "มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">กำลังโหลดโดเมน...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>การจัดการโดเมน</CardTitle>
          <CardDescription>จัดการโดเมนสำหรับลิงก์สั้นที่มีอยู่</CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มโดเมน
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>เพิ่มโดเมนใหม่</DialogTitle>
                <DialogDescription>เพิ่มโดเมนใหม่สำหรับการสร้างลิงก์สั้น</DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="domain">โดเมน</Label>
                  <Input
                    id="domain"
                    placeholder="ตัวอย่าง.com"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button onClick={addDomain} disabled={isAddingDomain || !newDomain.trim()}>
                  {isAddingDomain ? "กำลังเพิ่ม..." : "เพิ่มโดเมน"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {domains.map((domain) => (
        <Card key={domain.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{domain.domain}</code>
                  {domain.isActive ? (
                    <Badge variant="secondary">ใช้งานอยู่</Badge>
                  ) : (
                    <Badge variant="outline">ไม่ใช้งาน</Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{domain._count.links} ลิงก์ที่สร้างแล้ว</span>
                  <span>เพิ่มเมื่อ {new Date(domain.createdAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={domain.isActive}
                    onCheckedChange={(checked) => toggleDomainStatus(domain.id, checked)}
                  />
                  <Label className="text-sm">เปิดใช้งาน</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
