import { prisma } from "@/lib/prisma"
import { generateUniqueShortCode, isShortCodeAvailable, isValidUrl, isValidShortCode } from "./shortcode"
import { UserRole, DomainRestriction } from "@prisma/client"
import { processAnalyticsData } from "./analytics"

// Prisma unique-constraint violation. The shortCode/domain check-then-create
// is not atomic, so a concurrent insert can still collide on @@unique.
function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: string }).code === "P2002"
  )
}

export interface CreateLinkParams {
  originalUrl: string
  title?: string
  description?: string
  customShortCode?: string
  domainId: string
  userId: string
  userRole: UserRole
  expiresAt?: Date
}

export interface CreateLinkResult {
  success: boolean
  link?: {
    id: string
    shortCode: string
    originalUrl: string
    domain: string
    fullUrl: string
  }
  customRequest?: {
    id: string
    status: string
  }
  error?: string
}

export async function createLink(params: CreateLinkParams): Promise<CreateLinkResult> {
  const { originalUrl, title, description, customShortCode, domainId, userId, userRole, expiresAt } = params

  // Validate URL
  if (!isValidUrl(originalUrl)) {
    return { success: false, error: "Invalid URL format" }
  }

  // Get domain info with restrictions
  const domain = await prisma.domain.findUnique({
    where: { id: domainId, isActive: true },
    include: {
      allowedUsers: {
        select: { userId: true }
      }
    }
  })

  if (!domain) {
    return { success: false, error: "Domain not found or inactive" }
  }

  // Check domain restrictions
  const isAdmin = userRole === UserRole.ADMIN
  const canUseDomain = 
    domain.restriction === DomainRestriction.EVERYONE ||
    (domain.restriction === DomainRestriction.ADMIN_ONLY && isAdmin) ||
    (domain.restriction === DomainRestriction.SPECIFIC_USERS && 
     domain.allowedUsers.some(allowedUser => allowedUser.userId === userId))

  if (!canUseDomain) {
    return { success: false, error: "You don't have permission to use this domain" }
  }

  // Check user's link limit (for regular users)
  if (userRole === UserRole.USER) {
    const userLinkCount = await prisma.link.count({
      where: { userId, isActive: true },
    })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { linkLimit: true },
    })

    // A negative limit (e.g. -1) means unlimited.
    if (user && user.linkLimit >= 0 && userLinkCount >= user.linkLimit) {
      return { success: false, error: "Link limit exceeded" }
    }
  }

  // Handle custom shortcode
  if (customShortCode) {
    if (!isValidShortCode(customShortCode)) {
      return { success: false, error: "Invalid shortcode format" }
    }

    const isAvailable = await isShortCodeAvailable(customShortCode, domainId)
    if (!isAvailable) {
      return { success: false, error: "Shortcode already exists" }
    }

    // Special users and admins can create custom links directly
    if (userRole === UserRole.SPECIAL_USER || userRole === UserRole.ADMIN) {
      try {
        const link = await prisma.link.create({
          data: {
            shortCode: customShortCode,
            originalUrl,
            title,
            description,
            domainId,
            userId,
            isCustom: true,
            expiresAt,
          },
        })

        return {
          success: true,
          link: {
            id: link.id,
            shortCode: link.shortCode,
            originalUrl: link.originalUrl,
            domain: domain.domain,
            fullUrl: `https://${domain.domain}/${link.shortCode}`,
          },
        }
      } catch (error) {
        // Lost the race against a concurrent insert of the same shortcode.
        if (isUniqueConstraintError(error)) {
          return { success: false, error: "Shortcode already exists" }
        }
        throw error
      }
    } else {
      // Regular users need approval for custom shortcodes
      const customRequest = await prisma.customLinkRequest.create({
        data: {
          shortCode: customShortCode,
          originalUrl,
          title,
          description,
          domainId,
          userId,
        },
      })

      return {
        success: true,
        customRequest: {
          id: customRequest.id,
          status: "pending_approval",
        },
      }
    }
  }

  // Generate automatic shortcode. Retry on the (rare) race where a concurrent
  // request grabbed the same generated code between check and insert.
  const maxCreateAttempts = 5
  for (let attempt = 0; attempt < maxCreateAttempts; attempt++) {
    const shortCode = await generateUniqueShortCode(domainId)
    try {
      const link = await prisma.link.create({
        data: {
          shortCode,
          originalUrl,
          title,
          description,
          domainId,
          userId,
          isCustom: false,
          expiresAt,
        },
      })

      return {
        success: true,
        link: {
          id: link.id,
          shortCode: link.shortCode,
          originalUrl: link.originalUrl,
          domain: domain.domain,
          fullUrl: `https://${domain.domain}/${link.shortCode}`,
        },
      }
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        continue // collision — generate a fresh code and retry
      }
      throw error
    }
  }

  return { success: false, error: "Failed to generate a unique shortcode" }
}

export async function getLinkByShortCode(shortCode: string, domain: string) {
  return await prisma.link.findFirst({
    where: {
      shortCode,
      domain: { domain },
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    include: {
      domain: true,
      user: {
        select: { name: true, email: true },
      },
    },
  })
}

export async function incrementClickCount(
  linkId: string,
  rawAnalyticsData?: {
    ipAddress?: string
    userAgent?: string
    referer?: string
    country?: string
    city?: string
    language?: string
  },
) {
  // Increment click count
  await prisma.link.update({
    where: { id: linkId },
    data: { clicks: { increment: 1 } },
  })

  // Record enhanced analytics if data provided
  if (rawAnalyticsData) {
    const enhancedData = processAnalyticsData(
      rawAnalyticsData.userAgent,
      rawAnalyticsData.referer,
      rawAnalyticsData.language
    )

    await prisma.linkAnalytics.create({
      data: {
        linkId,
        ipAddress: rawAnalyticsData.ipAddress,
        userAgent: rawAnalyticsData.userAgent,
        referer: rawAnalyticsData.referer,
        country: rawAnalyticsData.country,
        city: rawAnalyticsData.city,
        language: rawAnalyticsData.language,
        device: enhancedData.device,
        browser: enhancedData.browser,
        os: enhancedData.os,
        utm_source: enhancedData.utm_source,
        utm_medium: enhancedData.utm_medium,
        utm_campaign: enhancedData.utm_campaign,
        utm_term: enhancedData.utm_term,
        utm_content: enhancedData.utm_content,
      },
    })
  }
}

export async function getUserLinks(userId: string, page = 1, limit = 10) {
  const skip = (page - 1) * limit

  const [links, total] = await Promise.all([
    prisma.link.findMany({
      where: { userId, isActive: true },
      include: {
        domain: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.link.count({
      where: { userId, isActive: true },
    }),
  ])

  return {
    links: links.map((link) => ({
      ...link,
      fullUrl: `https://${link.domain.domain}/${link.shortCode}`,
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

export async function deleteLink(linkId: string, userId: string, userRole: UserRole, hardDelete = false) {
  const link = await prisma.link.findUnique({
    where: { id: linkId },
  })

  if (!link) {
    return { success: false, error: "Link not found" }
  }

  // Users can only delete their own links, admins can delete any
  if (link.userId !== userId && userRole !== UserRole.ADMIN) {
    return { success: false, error: "Unauthorized" }
  }

  if (hardDelete) {
    // Hard delete: remove from database completely
    await prisma.linkAnalytics.deleteMany({
      where: { linkId },
    })
    await prisma.link.delete({
      where: { id: linkId },
    })
  } else {
    // Soft delete: mark as inactive
    await prisma.link.update({
      where: { id: linkId },
      data: { isActive: false },
    })
  }

  return { success: true }
}
