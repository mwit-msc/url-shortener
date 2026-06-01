import { prisma } from "@/lib/prisma"
import { Prisma, UserRole } from "@prisma/client"

type DailyCountRow = { date: Date; count: number }

// Buckets daily-count rows (already grouped per day by SQL date_trunc) into a
// date-string keyed map.
function toDateMap(rows: DailyCountRow[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const row of rows) {
    const date = row.date.toISOString().split("T")[0]
    map.set(date, (map.get(date) || 0) + Number(row.count))
  }
  return map
}
import type { LinkAnalyticsSummary, UserAnalyticsOverview, AdminAnalyticsOverview } from "./analytics"

// Get detailed analytics for a specific link (for SPECIAL_USER and ADMIN)
export async function getLinkAnalytics(
  linkId: string,
  userId: string,
  userRole: UserRole,
  dateRange?: { from: Date; to: Date }
): Promise<LinkAnalyticsSummary | null> {
  // Check if user has permission to view analytics
  if (userRole === UserRole.USER) {
    return null // Regular users don't get detailed analytics
  }

  const link = await prisma.link.findUnique({
    where: { id: linkId },
    include: { user: { select: { id: true } } }
  })

  if (!link) return null

  // SPECIAL_USER can only view their own links, ADMIN can view all
  if (userRole === UserRole.SPECIAL_USER && link.userId !== userId) {
    return null
  }

  const whereClause = {
    linkId,
    ...(dateRange && {
      clickedAt: {
        gte: dateRange.from,
        lte: dateRange.to
      }
    })
  }

  const [analytics, countryCounts, deviceCounts, browserCounts, refererCounts] = await Promise.all([
    // Get all analytics for this link
    prisma.linkAnalytics.findMany({
      where: whereClause,
      orderBy: { clickedAt: 'desc' }
    }),

    // Top countries
    prisma.linkAnalytics.groupBy({
      by: ['country'],
      where: { ...whereClause, country: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }),

    // Top devices
    prisma.linkAnalytics.groupBy({
      by: ['device'],
      where: { ...whereClause, device: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }),

    // Top browsers
    prisma.linkAnalytics.groupBy({
      by: ['browser'],
      where: { ...whereClause, browser: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }),

    // Top referers
    prisma.linkAnalytics.groupBy({
      by: ['referer'],
      where: { ...whereClause, referer: { not: null } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    })
  ])

  // Calculate unique clicks (approximate based on userAgent + referer + browser)
  const uniqueFingerprints = new Set(
    analytics.map(a => `${a.userAgent}-${a.referer}-${a.browser}`)
  )

  // Daily clicks for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const dailyClicksRows = await prisma.$queryRaw<DailyCountRow[]>(Prisma.sql`
    SELECT date_trunc('day', "clickedAt") AS date, COUNT(*)::int AS count
    FROM "link_analytics"
    WHERE "linkId" = ${linkId} AND "clickedAt" >= ${thirtyDaysAgo}
    GROUP BY 1
    ORDER BY 1
  `)
  const dailyClicksMap = toDateMap(dailyClicksRows)

  // Hourly distribution
  const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    clicks: analytics.filter(a => a.clickedAt.getHours() === hour).length
  }))

  return {
    totalClicks: analytics.length,
    uniqueClicks: uniqueFingerprints.size,
    topCountries: countryCounts.map(c => ({
      country: c.country || 'Unknown',
      count: c._count.id
    })),
    topDevices: deviceCounts.map(d => ({
      device: d.device || 'Unknown',
      count: d._count.id
    })),
    topBrowsers: browserCounts.map(b => ({
      browser: b.browser || 'Unknown',
      count: b._count.id
    })),
    topReferers: refererCounts.map(r => ({
      referer: r.referer || 'Direct',
      count: r._count.id
    })),
    dailyClicks: Array.from(dailyClicksMap.entries()).map(([date, clicks]) => ({
      date,
      clicks
    })),
    hourlyDistribution
  }
}

// Get user analytics overview (for SPECIAL_USER and ADMIN)
export async function getUserAnalyticsOverview(
  userId: string,
  userRole: UserRole,
  dateRange?: { from: Date; to: Date }
): Promise<UserAnalyticsOverview | null> {
  if (userRole === UserRole.USER) {
    return null // Regular users don't get detailed analytics
  }

  const whereClause = {
    userId,
    ...(dateRange && {
      createdAt: {
        gte: dateRange.from,
        lte: dateRange.to
      }
    })
  }

  const [links, clicksSum, topLinks] = await Promise.all([
    // Get all user links
    prisma.link.findMany({
      where: whereClause,
      include: {
        domain: { select: { domain: true } },
        _count: { select: { analytics: true } }
      }
    }),

    // Get total clicks
    prisma.link.aggregate({
      where: whereClause,
      _sum: { clicks: true }
    }),

    // Top performing links
    prisma.link.findMany({
      where: whereClause,
      include: { domain: { select: { domain: true } } },
      orderBy: { clicks: 'desc' },
      take: 10
    })
  ])

  const totalClicks = clicksSum._sum.clicks || 0
  const avgClicksPerLink = links.length > 0 ? totalClicks / links.length : 0

  // Click trends for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const clickTrendsRows = await prisma.$queryRaw<DailyCountRow[]>(Prisma.sql`
    SELECT date_trunc('day', a."clickedAt") AS date, COUNT(*)::int AS count
    FROM "link_analytics" a
    JOIN "links" l ON l.id = a."linkId"
    WHERE l."userId" = ${userId} AND a."clickedAt" >= ${thirtyDaysAgo}
    GROUP BY 1
    ORDER BY 1
  `)
  const clickTrendsMap = toDateMap(clickTrendsRows)

  return {
    totalLinks: links.length,
    totalClicks,
    avgClicksPerLink,
    topPerformingLinks: topLinks.map(link => ({
      id: link.id,
      shortCode: link.shortCode,
      title: link.title || undefined,
      originalUrl: link.originalUrl,
      clicks: link.clicks,
      domain: link.domain.domain
    })),
    clickTrends: Array.from(clickTrendsMap.entries()).map(([date, clicks]) => ({
      date,
      clicks
    }))
  }
}

// Get admin analytics overview (ADMIN only)
export async function getAdminAnalyticsOverview(
  userRole: UserRole,
  dateRange?: { from: Date; to: Date }
): Promise<AdminAnalyticsOverview | null> {
  if (userRole !== UserRole.ADMIN) {
    return null
  }

  // Growth/trend charts are bounded by the requested range, defaulting to the
  // last 30 days. Top-level totals stay lifetime by design.
  const trendFrom =
    dateRange?.from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  const trendTo = dateRange?.to ?? new Date()

  const [
    totalUsers,
    totalLinks,
    totalClicksSum,
    activeUsersCount,
    dailyActiveUsers,
    topDomains,
    userGrowthData,
    linkGrowthData,
    clickTrendsData
  ] = await Promise.all([
    // Total users
    prisma.user.count(),

    // Total links
    prisma.link.count(),

    // Total clicks
    prisma.link.aggregate({
      _sum: { clicks: true }
    }),

    // Active users (created at least one link)
    prisma.user.count({
      where: {
        links: {
          some: {}
        }
      }
    }),

    // Daily active users (users who had clicks today)
    prisma.user.count({
      where: {
        links: {
          some: {
            analytics: {
              some: {
                clickedAt: {
                  gte: new Date(new Date().setHours(0, 0, 0, 0))
                }
              }
            }
          }
        }
      }
    }),

    // Top domains
    prisma.domain.findMany({
      include: {
        links: {
          include: {
            _count: { select: { analytics: true } }
          }
        },
        _count: { select: { links: true } }
      },
      orderBy: {
        links: {
          _count: 'desc'
        }
      },
      take: 10
    }),

    // User growth (within range)
    prisma.$queryRaw<DailyCountRow[]>(Prisma.sql`
      SELECT date_trunc('day', "createdAt") AS date, COUNT(*)::int AS count
      FROM "users"
      WHERE "createdAt" >= ${trendFrom} AND "createdAt" <= ${trendTo}
      GROUP BY 1 ORDER BY 1
    `),

    // Link growth (within range)
    prisma.$queryRaw<DailyCountRow[]>(Prisma.sql`
      SELECT date_trunc('day', "createdAt") AS date, COUNT(*)::int AS count
      FROM "links"
      WHERE "createdAt" >= ${trendFrom} AND "createdAt" <= ${trendTo}
      GROUP BY 1 ORDER BY 1
    `),

    // Click trends (within range)
    prisma.$queryRaw<DailyCountRow[]>(Prisma.sql`
      SELECT date_trunc('day', "clickedAt") AS date, COUNT(*)::int AS count
      FROM "link_analytics"
      WHERE "clickedAt" >= ${trendFrom} AND "clickedAt" <= ${trendTo}
      GROUP BY 1 ORDER BY 1
    `)
  ])

  const userGrowthMap = toDateMap(userGrowthData)
  const linkGrowthMap = toDateMap(linkGrowthData)
  const clickTrendsMap = toDateMap(clickTrendsData)

  return {
    totalUsers,
    totalLinks,
    totalClicks: totalClicksSum._sum.clicks || 0,
    activeUsers: activeUsersCount,
    dailyActiveUsers,
    topDomains: topDomains.map(domain => ({
      domain: domain.domain,
      links: domain._count.links,
      clicks: domain.links.reduce((sum, link) => sum + link._count.analytics, 0)
    })),
    userGrowth: Array.from(userGrowthMap.entries()).map(([date, users]) => ({
      date,
      users
    })),
    linkGrowth: Array.from(linkGrowthMap.entries()).map(([date, links]) => ({
      date,
      links
    })),
    clickTrends: Array.from(clickTrendsMap.entries()).map(([date, clicks]) => ({
      date,
      clicks
    }))
  }
}