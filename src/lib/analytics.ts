import { UAParser } from "ua-parser-js"

export interface AnalyticsData {
  ipAddress?: string
  userAgent?: string
  referer?: string
  country?: string
  city?: string
  device?: string
  browser?: string
  os?: string
  language?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
}

export interface DetailedAnalyticsData extends AnalyticsData {
  clickedAt: Date
}

export function parseUserAgent(userAgent: string): { device: string; browser: string; os: string } {
  const parser = new UAParser(userAgent)
  const result = parser.getResult()

  const device = result.device.type || 'Desktop'
  const browser = result.browser.name || 'Unknown'
  const os = result.os.name || 'Unknown'

  return {
    device: device.charAt(0).toUpperCase() + device.slice(1).toLowerCase(),
    browser,
    os
  }
}

export function extractUTMParameters(url: string): {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
} {
  try {
    const urlObj = new URL(url)
    const params = urlObj.searchParams

    return {
      utm_source: params.get('utm_source') || undefined,
      utm_medium: params.get('utm_medium') || undefined,
      utm_campaign: params.get('utm_campaign') || undefined,
      utm_term: params.get('utm_term') || undefined,
      utm_content: params.get('utm_content') || undefined,
    }
  } catch {
    return {}
  }
}

export function processAnalyticsData(
  userAgent?: string,
  referer?: string,
  language?: string
): Partial<AnalyticsData> {
  const analytics: Partial<AnalyticsData> = {
    userAgent,
    referer,
    language,
  }

  if (userAgent) {
    const { device, browser, os } = parseUserAgent(userAgent)
    analytics.device = device
    analytics.browser = browser
    analytics.os = os
  }

  if (referer) {
    const utmParams = extractUTMParameters(referer)
    Object.assign(analytics, utmParams)
  }

  return analytics
}

// Analytics aggregation functions for dashboards
export interface LinkAnalyticsSummary {
  totalClicks: number
  uniqueClicks: number
  topCountries: Array<{ country: string; count: number }>
  topDevices: Array<{ device: string; count: number }>
  topBrowsers: Array<{ browser: string; count: number }>
  topReferers: Array<{ referer: string; count: number }>
  dailyClicks: Array<{ date: string; clicks: number }>
  hourlyDistribution: Array<{ hour: number; clicks: number }>
}

export interface UserAnalyticsOverview {
  totalLinks: number
  totalClicks: number
  avgClicksPerLink: number
  topPerformingLinks: Array<{
    id: string
    shortCode: string
    title?: string
    originalUrl: string
    clicks: number
    domain: string
  }>
  clickTrends: Array<{ date: string; clicks: number }>
}

export interface AdminAnalyticsOverview {
  totalUsers: number
  totalLinks: number
  totalClicks: number
  activeUsers: number
  dailyActiveUsers: number
  topDomains: Array<{ domain: string; links: number; clicks: number }>
  userGrowth: Array<{ date: string; users: number }>
  linkGrowth: Array<{ date: string; links: number }>
  clickTrends: Array<{ date: string; clicks: number }>
}