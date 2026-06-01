"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Activity,
  Calendar,
  Eye,
  Filter,
  RefreshCw,
  User,
  ChevronLeft,
  ChevronRight
} from "lucide-react"
import { AdminAction } from "@prisma/client"

interface AdminLog {
  id: string
  action: AdminAction
  entityType: string
  entityId: string | null
  details: Record<string, unknown> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
  admin: {
    id: string
    name: string | null
    email: string | null
  }
}

interface AdminLogSummary {
  totalActions: number
  actionCounts: Array<{ action: AdminAction; count: number }>
  mostActiveAdmins: Array<{
    admin: { id: string; name: string | null; email: string | null } | undefined
    actionCount: number
  }>
  recentCriticalActions: Array<{
    id: string
    action: AdminAction
    entityType: string
    entityId: string | null
    details: Record<string, unknown> | null
    createdAt: string
    admin: { name: string | null; email: string | null }
  }>
}

export function AdminLogsPanel() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [summary, setSummary] = useState<AdminLogSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedAction, setSelectedAction] = useState<string>("")
  const [selectedEntityType, setSelectedEntityType] = useState<string>("")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")

  const fetchLogs = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20'
      })

      if (selectedAction) params.append('action', selectedAction)
      if (selectedEntityType) params.append('entityType', selectedEntityType)
      if (dateFrom) params.append('from', dateFrom)
      if (dateTo) params.append('to', dateTo)

      const response = await fetch(`/api/admin/logs?${params}`)
      const data = await response.json()

      if (response.ok) {
        setLogs(data.logs)
        setTotalPages(data.pagination.pages)
      } else {
        console.error("Error fetching admin logs:", data.error)
      }
    } catch (error) {
      console.error("Error fetching admin logs:", error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, selectedAction, selectedEntityType, dateFrom, dateTo])

  const fetchSummary = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (dateFrom) params.append('from', dateFrom)
      if (dateTo) params.append('to', dateTo)

      const response = await fetch(`/api/admin/logs/summary?${params}`)
      const data = await response.json()

      if (response.ok) {
        setSummary(data)
      }
    } catch (error) {
      console.error("Error fetching admin summary:", error)
    }
  }, [dateFrom, dateTo])

  useEffect(() => {
    const fetchData = async () => {
      await fetchLogs()
      await fetchSummary()
    }
    fetchData()
  }, [fetchLogs, fetchSummary])

  const getActionBadgeColor = (action: AdminAction) => {
    const criticalActions: AdminAction[] = [
      AdminAction.USER_BANNED,
      AdminAction.LINK_DELETED,
      AdminAction.DOMAIN_DELETED,
      AdminAction.SYSTEM_SETTINGS_CHANGED
    ]

    if (criticalActions.includes(action)) {
      return "destructive"
    }

    if (action.includes("APPROVED") || action.includes("RESOLVED")) {
      return "default"
    }

    return "secondary"
  }

  const clearFilters = () => {
    setSelectedAction("")
    setSelectedEntityType("")
    setDateFrom("")
    setDateTo("")
    setCurrentPage(1)
  }

  const actionLabels: Record<AdminAction, string> = {
    [AdminAction.USER_ROLE_CHANGED]: "เปลี่ยนบทบาทผู้ใช้",
    [AdminAction.USER_LIMIT_CHANGED]: "เปลี่ยนขีดจำกัดผู้ใช้",
    [AdminAction.USER_BANNED]: "แบนผู้ใช้",
    [AdminAction.USER_UNBANNED]: "ปลดแบนผู้ใช้",
    [AdminAction.LINK_DELETED]: "ลบลิงก์",
    [AdminAction.LINK_DEACTIVATED]: "ปิดการใช้งานลิงก์",
    [AdminAction.LINK_REACTIVATED]: "เปิดการใช้งานลิงก์",
    [AdminAction.CUSTOM_REQUEST_APPROVED]: "อนุมัติคำขอ URL ที่กำหนดเอง",
    [AdminAction.CUSTOM_REQUEST_REJECTED]: "ปฏิเสธคำขอ URL ที่กำหนดเอง",
    [AdminAction.DOMAIN_CREATED]: "สร้างโดเมน",
    [AdminAction.DOMAIN_UPDATED]: "อัปเดตโดเมน",
    [AdminAction.DOMAIN_DELETED]: "ลบโดเมน",
    [AdminAction.ABUSE_REPORT_REVIEWED]: "ตรวจสอบรายงานการละเมิด",
    [AdminAction.SYSTEM_SETTINGS_CHANGED]: "เปลี่ยนการตั้งค่าระบบ",
    [AdminAction.BULK_ACTION_PERFORMED]: "ดำเนินการแบบกลุ่ม"
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">การดำเนินการทั้งหมด</p>
                  <p className="text-2xl font-bold">{summary.totalActions.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Admin ที่ทำงานมากที่สุด</p>
                  <p className="text-lg font-bold truncate">
                    {summary.mostActiveAdmins[0]?.admin?.name || "ไม่มีข้อมูล"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {summary.mostActiveAdmins[0]?.actionCount || 0} การดำเนินการ
                  </p>
                </div>
                <User className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">การดำเนินการที่สำคัญล่าสุด</p>
                  <p className="text-2xl font-bold">{summary.recentCriticalActions.length}</p>
                </div>
                <Eye className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ประเภทการดำเนินการ</p>
                  <p className="text-2xl font-bold">{summary.actionCounts.length}</p>
                </div>
                <Filter className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            ตัวกรอง
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="action-filter">การดำเนินการ</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกการดำเนินการ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ทั้งหมด</SelectItem>
                  {Object.entries(actionLabels).map(([action, label]) => (
                    <SelectItem key={action} value={action}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="entity-filter">ประเภทข้อมูล</Label>
              <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                <SelectTrigger>
                  <SelectValue placeholder="เลือกประเภทข้อมูล" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">ทั้งหมด</SelectItem>
                  <SelectItem value="user">ผู้ใช้</SelectItem>
                  <SelectItem value="link">ลิงก์</SelectItem>
                  <SelectItem value="domain">โดเมน</SelectItem>
                  <SelectItem value="custom_request">คำขอ URL ที่กำหนดเอง</SelectItem>
                  <SelectItem value="abuse_report">รายงานการละเมิด</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-from">วันที่เริ่มต้น</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to">วันที่สิ้นสุด</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button onClick={fetchLogs} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเฟรช
            </Button>
            <Button onClick={clearFilters} variant="outline" size="sm">
              ล้างตัวกรอง
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            บันทึกการดำเนินการ
          </CardTitle>
          <CardDescription>
            หน้า {currentPage} จาก {totalPages}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>เวลา</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>การดำเนินการ</TableHead>
                    <TableHead>ประเภท</TableHead>
                    <TableHead>รายละเอียด</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString('th-TH')}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.admin.name || 'ไม่ระบุ'}</p>
                          <p className="text-xs text-muted-foreground">{log.admin.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getActionBadgeColor(log.action)}>
                          {actionLabels[log.action] || log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.entityType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>รายละเอียดการดำเนินการ</DialogTitle>
                              <DialogDescription>
                                การดำเนินการเมื่อ {new Date(log.createdAt).toLocaleString('th-TH')}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>การดำเนินการ</Label>
                                  <p className="font-medium">{actionLabels[log.action]}</p>
                                </div>
                                <div>
                                  <Label>ประเภทข้อมูล</Label>
                                  <p className="font-medium">{log.entityType}</p>
                                </div>
                                {log.entityId && (
                                  <div>
                                    <Label>ID ข้อมูล</Label>
                                    <p className="font-medium font-mono text-xs">{log.entityId}</p>
                                  </div>
                                )}
                                {log.ipAddress && (
                                  <div>
                                    <Label>IP Address</Label>
                                    <p className="font-medium font-mono text-xs">{log.ipAddress}</p>
                                  </div>
                                )}
                              </div>
                              {log.details && (
                                <div>
                                  <Label>รายละเอียดเพิ่มเติม</Label>
                                  <pre className="text-xs bg-muted p-3 rounded-md overflow-auto max-h-40">
                                    {JSON.stringify(log.details, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  หน้า {currentPage} จาก {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    ก่อนหน้า
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    ถัดไป
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}