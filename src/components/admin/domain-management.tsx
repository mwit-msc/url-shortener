"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Settings, Mail } from "lucide-react"
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
  const [bulkEmailInput, setBulkEmailInput] = useState("")
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
        setBulkEmailInput("")
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
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>ตั้งค่าโดเมน: {editingDomain.domain}</DialogTitle>
              <DialogDescription>จัดการการจำกัดการใช้งานโดเมน</DialogDescription>
            </DialogHeader>

            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor="restriction">การจำกัดการใช้งาน</Label>
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="bulk-emails">เพิ่มอีเมลหลายๆ อัน</Label>
                    <div className="space-y-2">
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="bulk-emails"
                          placeholder="email1@domain.com, email2@domain.com, email3@domain.com"
                          value={bulkEmailInput}
                          onChange={(e) => setBulkEmailInput(e.target.value)}
                          className="pl-9"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const emails = bulkEmailInput.split(',').map(email => email.trim()).filter(email => email)
                          const matchingUsers = users.filter(user => emails.includes(user.email))
                          const newSelectedIds = matchingUsers.map(user => user.id)
                          const uniqueIds = [...new Set([...selectedUsers, ...newSelectedIds])]
                          setSelectedUsers(uniqueIds)
                          setBulkEmailInput('')
                          toast({
                            title: "อัปเดตสำเร็จ",
                            description: `เพิ่ม ${matchingUsers.length} ผู้ใช้จากอีเมลที่กรอก`,
                          })
                        }}
                        disabled={!bulkEmailInput.trim()}
                      >
                        เพิ่มจากอีเมล
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      คั่นอีเมลด้วยเครื่องหมายจุลภาค (,) สามารถเพิ่มได้เฉพาะผู้ใช้ที่มีอยู่ในระบบเท่านั้น
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>ผู้ใช้ที่ได้รับอนุญาต ({selectedUsers.length})</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedUsers([])}
                        disabled={selectedUsers.length === 0}
                      >
                        ล้างทั้งหมด
                      </Button>
                    </div>
                    <div className="max-h-48 overflow-y-auto border rounded-md">
                      <div className="p-3 space-y-3">
                        {users.map((user) => (
                          <div key={user.id} className="flex items-start space-x-3">
                            <input
                              type="checkbox"
                              id={`user-${user.id}`}
                              className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary"
                              checked={selectedUsers.includes(user.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedUsers([...selectedUsers, user.id])
                                } else {
                                  setSelectedUsers(selectedUsers.filter(id => id !== user.id))
                                }
                              }}
                            />
                            <label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                              <div className="text-sm font-medium">{user.name || user.email}</div>
                              {user.name && (
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                              )}
                            </label>
                          </div>
                        ))}
                        {users.length === 0 && (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            ไม่พบผู้ใช้ในระบบ
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => {
                setEditingDomain(null)
                setSelectedUsers([])
                setBulkEmailInput('')
              }}>
                ยกเลิก
              </Button>
              <Button 
                onClick={() => updateDomainRestriction(
                  editingDomain.id, 
                  editingDomain.restriction,
                  editingDomain.restriction === "SPECIFIC_USERS" ? selectedUsers : undefined
                )}
                className="w-full sm:w-auto"
              >
                บันทึกการเปลี่ยนแปลง
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
