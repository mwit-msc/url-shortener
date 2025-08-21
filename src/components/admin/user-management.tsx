"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserRole } from "@prisma/client"
import { useToast } from "@/hooks/use-toast"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"

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
  const [currentPage, setCurrentPage] = useState(1)
  const [usersPerPage] = useState(10)
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

  // Pagination calculations
  const totalUsers = filteredUsers.length
  const totalPages = Math.ceil(totalUsers / usersPerPage)
  const startIndex = (currentPage - 1) * usersPerPage
  const endIndex = startIndex + usersPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex).sort((a, b) => {
    if (a.role === b.role) return 0
    if (a.role === UserRole.ADMIN) return -1
    if (b.role === UserRole.ADMIN) return 1
    if (a.role === UserRole.SPECIAL_USER) return -1
    if (b.role === UserRole.SPECIAL_USER) return 1
    return 0
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, roleFilter])

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
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
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
              <SelectTrigger className="w-full sm:w-48">
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

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">ชื่อ</TableHead>
                  <TableHead className="hidden sm:table-cell">อีเมล</TableHead>
                  <TableHead className="w-[120px]">บทบาท</TableHead>
                  <TableHead className="hidden md:table-cell text-right">ลิงก์</TableHead>
                  <TableHead className="hidden lg:table-cell">เข้าร่วมเมื่อ</TableHead>
                  <TableHead className="hidden xl:table-cell">ขีดจำกัด</TableHead>
                  <TableHead className="w-[150px]">การจัดการ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="max-w-[180px] truncate">
                        {user.name || "ไม่มีชื่อ"}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="max-w-[200px] truncate text-muted-foreground">
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-right">
                      {user._count.links}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="hidden xl:table-cell text-sm text-muted-foreground">
                      {user.role === UserRole.USER ? user.linkLimit : "ไม่จำกัด"}
                    </TableCell>
                    <TableCell>
                      <Select value={user.role} onValueChange={(newRole: UserRole) => updateUserRole(user.id, newRole)}>
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={UserRole.USER}>ผู้ใช้</SelectItem>
                          <SelectItem value={UserRole.SPECIAL_USER}>ผู้ใช้พิเศษ</SelectItem>
                          <SelectItem value={UserRole.ADMIN}>ผู้ดูแลระบบ</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {currentUsers.length === 0 && (
            <div className="p-8 text-center">
              <p className="text-muted-foreground">ไม่พบผู้ใช้ที่ตรงกับเงื่อนไขของคุณ</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                แสดง {startIndex + 1}-{Math.min(endIndex, totalUsers)} จาก {totalUsers} ผู้ใช้
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">ก่อนหน้า</span>
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNumber)}
                        className="w-10 h-10"
                      >
                        {pageNumber}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  <span className="hidden sm:inline">ถัดไป</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
