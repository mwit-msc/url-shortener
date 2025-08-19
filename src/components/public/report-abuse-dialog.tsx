"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Flag, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ReportAbuseDialogProps {
  shortCode: string
  domain: string
  trigger?: React.ReactNode
}

const reportTypes = {
  SPAM: "Spam or unwanted content",
  MALWARE: "Malicious software or phishing",
  ILLEGAL: "Illegal content",
  COPYRIGHT: "Copyright infringement", 
  HARASSMENT: "Harassment or abuse",
  ADULT_CONTENT: "Adult/inappropriate content",
  SCAM: "Scam or fraud",
  OTHER: "Other"
}

export function ReportAbuseDialog({ shortCode, domain, trigger }: ReportAbuseDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    reportType: "",
    description: "",
    reporterEmail: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/public/report-abuse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shortCode,
          domain,
          ...formData
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({
          reportType: "",
          description: "",
          reporterEmail: ""
        })
      } else {
        setError(data.error || "Failed to submit report")
      }
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setIsSubmitted(false)
      setError("")
      setFormData({
        reportType: "",
        description: "",
        reporterEmail: ""
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Flag className="w-4 h-4 mr-2" />
            Report Abuse
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Abuse</DialogTitle>
          <DialogDescription>
            Report inappropriate content or abuse for link: {domain}/{shortCode}
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <div className="text-center">
              <h3 className="font-semibold">Report Submitted</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Thank you for helping keep our service safe. We will review your report.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type *</Label>
              <Select 
                value={formData.reportType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, reportType: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a report type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(reportTypes).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Please provide additional details about the issue (optional)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                maxLength={1000}
                rows={3}
              />
              <p className="text-xs text-muted-foreground">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporterEmail">Your Email (Optional)</Label>
              <Input
                id="reporterEmail"
                type="email"
                placeholder="your@email.com"
                value={formData.reporterEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, reporterEmail: e.target.value }))}
                maxLength={255}
              />
              <p className="text-xs text-muted-foreground">
                Optional. We may contact you for follow-up questions.
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.reportType}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}