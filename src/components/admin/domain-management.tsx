"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Settings } from "lucide-react"
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
  restriction: "EVERYONE" | "ADMIN_ONLY" | "SPECIFIC_USERS"
  createdAt: string
  _count: {
    links: number
  }
  allowedUsers: {
    user: {
      id: string
      name: string | null
      email: string
    }
  }[]
}

interface User {
  id: string
  name: string | null
  email: string
}

export function DomainManagement() {
  const [domains, setDomains] = useState<Domain[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newDomain, setNewDomain] = useState("")
  const [newDomainRestriction, setNewDomainRestriction] = useState<"EVERYONE" | "ADMIN_ONLY" | "SPECIFIC_USERS">("EVERYONE")
  const [isAddingDomain, setIsAddingDomain] = useState(false)
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    fetchDomains()
    fetchUsers()
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

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      if (response.ok) {
        setUsers(data.users || [])
      }
    } catch {
      console.error("Error fetching users")
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
        body: JSON.stringify({ 
          domain: newDomain.trim(),
          restriction: newDomainRestriction
        }),
      })

      if (response.ok) {
        toast({
          title: "Domain added",
          description: "New domain has been successfully added.",
        })
        setNewDomain("")
        setNewDomainRestriction("EVERYONE")
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

  const updateDomainRestriction = async (domainId: string, restriction: string, allowedUserIds?: string[]) => {
    try {
      const response = await fetch(`/api/admin/domains/${domainId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ restriction, allowedUserIds }),
      })

      if (response.ok) {
        toast({
          title: "โดเมนอัปเดตสำเร็จ",
          description: "การจำกัดโดเมนได้รับการอัปเดตเรียบร้อยแล้ว",
        })
        fetchDomains()
        setEditingDomain(null)
        setSelectedUsers([])
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
        description: "มีบางอย่างผิดพลาด กรุณาลองใหม่อีกครั้ง",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (domain: Domain) => {
    setEditingDomain(domain)
    setSelectedUsers(domain.allowedUsers.map(u => u.user.id))
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
                
                <div>
                  <Label htmlFor="restriction">การจำกัดการใช้งาน</Label>
                  <Select value={newDomainRestriction} onValueChange={(value) => setNewDomainRestriction(value as "EVERYONE" | "ADMIN_ONLY" | "SPECIFIC_USERS")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EVERYONE">ทุกคนใช้ได้</SelectItem>
                      <SelectItem value="ADMIN_ONLY">แอดมินเท่านั้น</SelectItem>
                      <SelectItem value="SPECIFIC_USERS">ผู้ใช้เฉพาะ</SelectItem>
                    </SelectContent>
                  </Select>
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
                <div className="flex items-center gap-2 flex-wrap">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">{domain.domain}</code>
                  {domain.isActive ? (
                    <Badge variant="secondary">ใช้งานอยู่</Badge>
                  ) : (
                    <Badge variant="outline">ไม่ใช้งาน</Badge>
                  )}
                  
                  <Badge variant={
                    domain.restriction === "EVERYONE" ? "default" :
                    domain.restriction === "ADMIN_ONLY" ? "destructive" : 
                    "secondary"
                  }>
                    {domain.restriction === "EVERYONE" ? "ทุกคน" :
                     domain.restriction === "ADMIN_ONLY" ? "แอดมิน" :
                     "ผู้ใช้เฉพาะ"}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{domain._count.links} ลิงก์ที่สร้างแล้ว</span>
                  <span>เพิ่มเมื่อ {new Date(domain.createdAt).toLocaleDateString()}</span>
                  {domain.restriction === "SPECIFIC_USERS" && domain.allowedUsers.length > 0 && (
                    <span>{domain.allowedUsers.length} ผู้ใช้ที่ได้รับอนุญาต</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditDialog(domain)}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  ตั้งค่า
                </Button>
                
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

      {/* Edit Domain Dialog */}
      {editingDomain && (
        <Dialog open={!!editingDomain} onOpenChange={() => setEditingDomain(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>ตั้งค่าโดเมน: {editingDomain.domain}</DialogTitle>
              <DialogDescription>จัดการการจำกัดการใช้งานโดเมน</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>การจำกัดการใช้งาน</Label>
                <Select 
                  value={editingDomain.restriction} 
                  onValueChange={(value) => 
                    setEditingDomain({...editingDomain, restriction: value as "EVERYONE" | "ADMIN_ONLY" | "SPECIFIC_USERS"})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EVERYONE">ทุกคนใช้ได้</SelectItem>
                    <SelectItem value="ADMIN_ONLY">แอดมินเท่านั้น</SelectItem>
                    <SelectItem value="SPECIFIC_USERS">ผู้ใช้เฉพาะ</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingDomain.restriction === "SPECIFIC_USERS" && (
                <div>
                  <Label>ผู้ใช้ที่ได้รับอนุญาต</Label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedUsers([...selectedUsers, user.id])
                            } else {
                              setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                            }
                          }}
                        />
                        <span className="text-sm">
                          {user.name || user.email}
                          {user.name && <span className="text-muted-foreground"> ({user.email})</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingDomain(null)}>
                ยกเลิก
              </Button>
              <Button 
                onClick={() => updateDomainRestriction(
                  editingDomain.id, 
                  editingDomain.restriction,
                  editingDomain.restriction === "SPECIFIC_USERS" ? selectedUsers : undefined
                )}
              >
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
