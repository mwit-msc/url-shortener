"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, AlertTriangle, Flag } from "lucide-react"

const reportTypes = {
  SPAM: "Spam or unwanted content",
  MALWARE: "Malware or phishing attempts", 
  ILLEGAL: "Illegal content",
  COPYRIGHT: "Copyright infringement",
  HARASSMENT: "Harassment or abuse",
  ADULT_CONTENT: "Adult/inappropriate content",
  SCAM: "Scam or fraud",
  OTHER: "Other"
}

interface ReportAbuseFormProps {
  embedded?: boolean
  prefilledUrl?: string
  prefilledDomain?: string
  prefilledCode?: string
}

export function ReportAbuseForm({ prefilledUrl, prefilledDomain, prefilledCode, embedded = false }: ReportAbuseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    reportType: "",
    description: "",
    reporterEmail: "",
    linkUrl: prefilledUrl || "",
    customUrl: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      // Parse the URL to extract shortCode and domain if provided
      let shortCode = prefilledCode
      let domain = prefilledDomain
      
      if (!shortCode && (formData.linkUrl || formData.customUrl)) {
        const urlToProcess = formData.linkUrl || formData.customUrl
        try {
          const url = new URL(urlToProcess)
          domain = url.hostname
          shortCode = url.pathname.substring(1) // Remove leading slash
        } catch {
          // If URL parsing fails, we'll try to extract from the string
          const urlParts = (formData.linkUrl || formData.customUrl).split('/')
          if (urlParts.length >= 2) {
            domain = urlParts[urlParts.length - 2] || urlParts[0]
            shortCode = urlParts[urlParts.length - 1]
          }
        }
      }

      if (!shortCode || !domain) {
        setError("Unable to identify the link to report. Please check the URL again.")
        setIsSubmitting(false)
        return
      }

      const response = await fetch("/api/public/report-abuse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          shortCode,
          domain,
          reportType: formData.reportType,
          description: formData.description,
          reporterEmail: formData.reporterEmail
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setIsSubmitted(true)
        setFormData({
          reportType: "",
          description: "",
          reporterEmail: "",
          linkUrl: "",
          customUrl: ""
        })
      } else {
        setError(data.error || "Unable to submit report")
      }
    } catch {
      setError("Connection error. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setIsSubmitted(false)
    setError("")
    setFormData({
      reportType: "",
      description: "",
      reporterEmail: "",
      linkUrl: prefilledUrl || "",
      customUrl: ""
    })
  }

  if (isSubmitted) {
    return (
      <Card className={embedded ? "border-0 bg-transparent p-0 gap-0" : "shadow-none"}>
        <CardContent className="pt-8 sm:pt-12">
          <div className="flex flex-col items-center justify-center py-12 sm:py-16 space-y-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold">Report Submitted Successfully</h3>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Thank you for helping keep our service safe. Our moderation team will review your report and take appropriate action.
              </p>
              <Button onClick={resetForm} size="lg" className="mt-6 text-lg px-8 py-4 h-auto" variant="outline">
                Submit Another Report
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={embedded ? "border-0 bg-transparent p-0 gap-0" : "shadow-none"}>
      {!embedded && <CardHeader className="space-y-4">
        <div className="flex items-center gap-4">
          <Flag className="w-6 h-6 text-primary" />
          <div>
            <CardTitle className="text-xl">Report Abuse Form</CardTitle>
            <CardDescription className="text-sm">
              Fill out the form below to report inappropriate or malicious links
            </CardDescription>
          </div>
        </div>
      </CardHeader>}
      <CardContent className={embedded ? "px-0" : undefined}>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Link URL Input */}
          {!prefilledUrl && !prefilledCode && (
            <div className="space-y-3">
              <Label htmlFor="customUrl" className="text-sm font-medium">
                URL to Report *
              </Label>
              <Input
                id="customUrl"
                type="url"
                placeholder="https://example.com/abc123 or example.com/abc123"
                value={formData.customUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, customUrl: e.target.value }))}
                required={!prefilledUrl && !prefilledCode}
                className="h-11 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter the shortened link you want to report
              </p>
            </div>
          )}

          {/* Prefilled URL Display */}
          {(prefilledUrl || prefilledCode) && (
            <div className="bg-muted p-6 rounded-lg space-y-3">
              <Label className="text-sm font-semibold">Link to Report:</Label>
              <p className="font-mono text-sm break-all bg-background p-3 rounded border">
                {prefilledDomain}/{prefilledCode}
              </p>
              {prefilledUrl && (
                <p className="text-sm text-muted-foreground break-all">
                  → {prefilledUrl}
                </p>
              )}
            </div>
          )}

          {/* Report Type */}
          <div className="space-y-3">
            <Label htmlFor="reportType" className="text-sm font-medium">
              Report Type *
            </Label>
            <Select 
              value={formData.reportType} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, reportType: value }))}
              required
            >
              <SelectTrigger id="reportType" className="w-full h-11 text-sm">
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(reportTypes).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-sm">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-medium">
              Additional Details
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide additional details about the issue (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              maxLength={1000}
              rows={5}
              className="text-sm resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {formData.description.length}/1000 characters
            </p>
          </div>

          {/* Reporter Email */}
          <div className="space-y-3">
            <Label htmlFor="reporterEmail" className="text-sm font-medium">
              Your Email (Optional)
            </Label>
            <Input
              id="reporterEmail"
              type="email"
              placeholder="your@email.com"
              value={formData.reporterEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, reporterEmail: e.target.value }))}
              maxLength={255}
              className="h-11 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Optional. We may contact you for follow-up questions.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="border-destructive/30 bg-destructive/10">
              <AlertTriangle className="w-5 h-5" />
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <Button 
              type="submit" 
              disabled={isSubmitting || !formData.reportType || (!prefilledCode && !formData.customUrl)}
              className="w-full h-12 text-sm font-medium"
              size="lg"
            >
              {isSubmitting ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>

        {/* Information Section */}
        <div className="mt-7 pt-6 border-t space-y-6">
          <h4 className="text-base font-semibold">What You Can Report</h4>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Spam or unwanted content</li>
            <li>• Malware or phishing attempts</li>
            <li>• Illegal content</li>
            <li>• Copyright infringement</li>
            <li>• Harassment or abuse</li>
            <li>• Adult/inappropriate content</li>
            <li>• Scam or fraud</li>
            <li>• Other violations</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            All reports will be reviewed by our moderation team. Thank you for helping keep our service safe and secure.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
