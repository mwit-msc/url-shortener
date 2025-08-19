"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, Eye, AlertTriangle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AbuseReport {
  id: string
  reportType: string
  description?: string
  reporterEmail?: string
  status: string
  createdAt: string
  reviewedAt?: string
  adminNote?: string
  link: {
    id: string
    shortCode: string
    originalUrl: string
    title?: string
    isActive: boolean
    domain: {
      domain: string
    }
    user: {
      id: string
      name?: string
      email: string
    }
  }
}

const reportTypeLabels = {
  SPAM: "Spam",
  MALWARE: "Malware/Phishing",
  ILLEGAL: "Illegal Content",
  COPYRIGHT: "Copyright",
  HARASSMENT: "Harassment",
  ADULT_CONTENT: "Adult Content",
  SCAM: "Scam/Fraud",
  OTHER: "Other"
}

const statusLabels = {
  PENDING: "Pending",
  INVESTIGATING: "Investigating",
  RESOLVED: "Resolved",
  DISMISSED: "Dismissed"
}

const statusColors = {
  PENDING: "bg-yellow-500",
  INVESTIGATING: "bg-blue-500", 
  RESOLVED: "bg-green-500",
  DISMISSED: "bg-gray-500"
}

export function AbuseReportsPanel() {
  const [reports, setReports] = useState<AbuseReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<AbuseReport | null>(null)
  const [adminNote, setAdminNote] = useState("")
  const [newStatus, setNewStatus] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filter, setFilter] = useState({
    status: "",
    reportType: ""
  })

  useEffect(() => {
    fetchReports()
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams()
      if (filter.status) params.append("status", filter.status)
      if (filter.reportType) params.append("reportType", filter.reportType)
      
      const response = await fetch(`/api/abuse-reports?${params}`)
      const data = await response.json()

      if (response.ok) {
        setReports(data.reports)
      } else {
        console.error("Failed to fetch reports:", data.error)
      }
    } catch (error) {
      console.error("Error fetching reports:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReviewReport = async () => {
    if (!selectedReport || !newStatus) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/abuse-reports/${selectedReport.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          adminNote: adminNote || undefined
        }),
      })

      if (response.ok) {
        fetchReports()
        setSelectedReport(null)
        setAdminNote("")
        setNewStatus("")
      } else {
        const data = await response.json()
        console.error("Failed to update report:", data.error)
      }
    } catch (error) {
      console.error("Error updating report:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleViewReport = (report: AbuseReport) => {
    setSelectedReport(report)
    setAdminNote(report.adminNote || "")
    setNewStatus(report.status)
  }

  if (isLoading) {
    return <div>Loading abuse reports...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Select value={filter.status} onValueChange={(value) => setFilter(prev => ({ ...prev, status: value }))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filter.reportType} onValueChange={(value) => setFilter(prev => ({ ...prev, reportType: value }))}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {Object.entries(reportTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {reports.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No abuse reports found.</p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      {reportTypeLabels[report.reportType as keyof typeof reportTypeLabels]}
                      <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                        {statusLabels[report.status as keyof typeof statusLabels]}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Reported on {new Date(report.createdAt).toLocaleDateString()}
                      {report.reporterEmail && ` by ${report.reporterEmail}`}
                    </CardDescription>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => handleViewReport(report)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Review
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Review Abuse Report</DialogTitle>
                        <DialogDescription>
                          Report Type: {reportTypeLabels[report.reportType as keyof typeof reportTypeLabels]}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold">Reported Link</h4>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="font-mono text-sm">
                              {report.link.domain.domain}/{report.link.shortCode}
                            </p>
                            <p className="text-sm text-muted-foreground break-all">
                              → {report.link.originalUrl}
                            </p>
                            {report.link.title && (
                              <p className="text-sm mt-1">Title: {report.link.title}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant={report.link.isActive ? "default" : "destructive"}>
                                {report.link.isActive ? "Active" : "Deactivated"}
                              </Badge>
                              <Button variant="outline" size="sm" asChild>
                                <a 
                                  href={`https://${report.link.domain.domain}/${report.link.shortCode}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Visit
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold">Link Owner</h4>
                          <p className="text-sm">{report.link.user.name || "Unknown"} ({report.link.user.email})</p>
                        </div>

                        {report.description && (
                          <div>
                            <h4 className="font-semibold">Report Description</h4>
                            <p className="text-sm bg-muted p-3 rounded-lg">{report.description}</p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select value={newStatus} onValueChange={setNewStatus}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(statusLabels).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="adminNote">Admin Note</Label>
                          <Textarea
                            id="adminNote"
                            placeholder="Add your review notes..."
                            value={adminNote}
                            onChange={(e) => setAdminNote(e.target.value)}
                            rows={3}
                          />
                        </div>

                        {newStatus === "RESOLVED" && report.link.isActive && (
                          <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Setting status to &quot;Resolved&quot; will automatically deactivate the reported link.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <DialogFooter>
                        <Button
                          onClick={handleReviewReport}
                          disabled={isSubmitting || !newStatus}
                        >
                          {isSubmitting ? "Updating..." : "Update Report"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Link: </span>
                    <span className="font-mono text-sm">
                      {report.link.domain.domain}/{report.link.shortCode}
                    </span>
                    <Button variant="link" size="sm" asChild className="ml-2 p-0 h-auto">
                      <a 
                        href={`https://${report.link.domain.domain}/${report.link.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                  <div>
                    <span className="font-semibold">Target: </span>
                    <span className="text-sm text-muted-foreground break-all">
                      {report.link.originalUrl}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Owner: </span>
                    <span className="text-sm">{report.link.user.email}</span>
                  </div>
                  {report.description && (
                    <div>
                      <span className="font-semibold">Description: </span>
                      <span className="text-sm">{report.description}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}