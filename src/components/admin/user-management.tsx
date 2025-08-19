"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserRole } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
import { Search } from "lucide-react"

interface User {
  id: string
  name?: string
  email: string
  role: UserRole
  linkLimit: number
  createdAt: string
  _count: {
    links: number
  }
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      const data = await response.json()

      if (response.ok) {
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const updateUserRole = async (userId: string, newRole: UserRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      })

      if (response.ok) {
        toast({
          title: "User updated",
          description: "User role has been successfully updated.",
        })
        fetchUsers() // Refresh the list
      } else {
        const data = await response.json()
        toast({
          title: "Error",
          description: data.error || "Failed to update user",
          variant: "destructive",
        })
      }
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge variant="destructive">Admin</Badge>
      case UserRole.SPECIAL_USER:
        return <Badge variant="secondary">Special User</Badge>
      default:
        return <Badge variant="outline">User</Badge>
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">กำลังโหลดข้อมูลผู้ใช้...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>การจัดการผู้ใช้</CardTitle>
          <CardDescription>จัดการสิทธิ์และบทบาทของผู้ใช้</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="ค้นหาผู้ใช้..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="กรองตามบทบาท" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทุกบทบาท</SelectItem>
                <SelectItem value={UserRole.USER}>ผู้ใช้</SelectItem>
                <SelectItem value={UserRole.SPECIAL_USER}>ผู้ใช้พิเศษ</SelectItem>
                <SelectItem value={UserRole.ADMIN}>ผู้ดูแลระบบ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredUsers.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{user.name || "ไม่มีชื่อ"}</span>
                  {getRoleBadge(user.role)}
                </div>

                <p className="text-sm text-muted-foreground">{user.email}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{user._count.links} ลิงก์ที่สร้างแล้ว</span>
                  <span>เข้าร่วมเมื่อ {new Date(user.createdAt).toLocaleDateString()}</span>
                  <span>ขีดจำกัด: {user.role === UserRole.USER ? user.linkLimit : "ไม่จำกัด"}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Select value={user.role} onValueChange={(newRole: UserRole) => updateUserRole(user.id, newRole)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={UserRole.USER}>ผู้ใช้</SelectItem>
                    <SelectItem value={UserRole.SPECIAL_USER}>ผู้ใช้พิเศษ</SelectItem>
                    <SelectItem value={UserRole.ADMIN}>ผู้ดูแลระบบ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">ไม่พบผู้ใช้ที่ตรงกับเงื่อนไขของคุณ</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
