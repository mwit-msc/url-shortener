import { prisma } from "@/lib/prisma"
import { AdminAction } from "@prisma/client"
import { headers } from "next/headers"

export interface LogAdminActionParams {
  adminId: string
  action: AdminAction
  entityType: string
  entityId?: string
  details?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
}

export async function logAdminAction(params: LogAdminActionParams) {
  try {
    await prisma.adminLog.create({
      data: {
        adminId: params.adminId,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId,
        details: params.details ? JSON.stringify(params.details) : undefined,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      },
    })
  } catch (error) {
    console.error("Failed to log admin action:", error)
    // Don't throw - logging failures shouldn't break the main operation
  }
}

// Helper function to log admin action with automatic header extraction
export async function logAdminActionWithHeaders(
  adminId: string,
  action: AdminAction,
  entityType: string,
  entityId?: string,
  details?: Record<string, unknown>
) {
  try {
    const headersList = await headers()
    const ipAddress = headersList.get("x-forwarded-for") ||
                     headersList.get("x-real-ip") ||
                     undefined
    const userAgent = headersList.get("user-agent") || undefined

    await logAdminAction({
      adminId,
      action,
      entityType,
      entityId,
      details,
      ipAddress,
      userAgent,
    })
  } catch (error) {
    console.error("Failed to log admin action with headers:", error)
  }
}

// Get admin logs with filtering and pagination
export async function getAdminLogs(params: {
  page?: number
  limit?: number
  adminId?: string
  action?: AdminAction
  entityType?: string
  dateRange?: { from: Date; to: Date }
}) {
  const {
    page = 1,
    limit = 50,
    adminId,
    action,
    entityType,
    dateRange,
  } = params

  const skip = (page - 1) * limit

  const whereClause: Record<string, unknown> = {}
  if (adminId) whereClause.adminId = adminId
  if (action) whereClause.action = action
  if (entityType) whereClause.entityType = entityType
  if (dateRange) {
    whereClause.createdAt = {
      gte: dateRange.from,
      lte: dateRange.to
    }
  }

  const [logs, total] = await Promise.all([
    prisma.adminLog.findMany({
      where: whereClause,
      include: {
        admin: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.adminLog.count({ where: whereClause })
  ])

  return {
    logs: logs.map(log => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      details: log.details ? JSON.parse(log.details as string) : null,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
      admin: {
        id: log.admin.id,
        name: log.admin.name,
        email: log.admin.email,
      },
    })),
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  }
}

// Get admin activity summary
export async function getAdminActivitySummary(dateRange?: { from: Date; to: Date }) {
  const whereClause = dateRange ? {
    createdAt: {
      gte: dateRange.from,
      lte: dateRange.to
    }
  } : {}

  const [totalActions, actionCounts, adminActivity, recentActions] = await Promise.all([
    // Total actions
    prisma.adminLog.count({ where: whereClause }),

    // Actions by type
    prisma.adminLog.groupBy({
      by: ['action'],
      where: whereClause,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    }),

    // Most active admins
    prisma.adminLog.groupBy({
      by: ['adminId'],
      where: whereClause,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10
    }),

    // Recent critical actions
    prisma.adminLog.findMany({
      where: {
        ...whereClause,
        action: {
          in: [
            AdminAction.USER_BANNED,
            AdminAction.LINK_DELETED,
            AdminAction.DOMAIN_DELETED,
            AdminAction.SYSTEM_SETTINGS_CHANGED
          ]
        }
      },
      include: {
        admin: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
  ])

  // Get admin names for activity summary
  const adminIds = adminActivity.map(a => a.adminId)
  const admins = await prisma.user.findMany({
    where: { id: { in: adminIds } },
    select: { id: true, name: true, email: true }
  })

  const adminMap = new Map(admins.map(a => [a.id, a]))

  return {
    totalActions,
    actionCounts: actionCounts.map(ac => ({
      action: ac.action,
      count: ac._count.id
    })),
    mostActiveAdmins: adminActivity.map(aa => ({
      admin: adminMap.get(aa.adminId),
      actionCount: aa._count.id
    })),
    recentCriticalActions: recentActions.map(action => ({
      id: action.id,
      action: action.action,
      entityType: action.entityType,
      entityId: action.entityId,
      details: action.details ? JSON.parse(action.details as string) : null,
      createdAt: action.createdAt,
      admin: action.admin
    }))
  }
}