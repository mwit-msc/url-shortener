-- CreateEnum
CREATE TYPE "mwit-link_tiny"."AdminAction" AS ENUM ('USER_ROLE_CHANGED', 'USER_LIMIT_CHANGED', 'USER_BANNED', 'USER_UNBANNED', 'LINK_DELETED', 'LINK_DEACTIVATED', 'LINK_REACTIVATED', 'CUSTOM_REQUEST_APPROVED', 'CUSTOM_REQUEST_REJECTED', 'DOMAIN_CREATED', 'DOMAIN_UPDATED', 'DOMAIN_DELETED', 'ABUSE_REPORT_REVIEWED', 'SYSTEM_SETTINGS_CHANGED', 'BULK_ACTION_PERFORMED');

-- AlterTable
ALTER TABLE "mwit-link_tiny"."link_analytics" ADD COLUMN     "browser" TEXT,
ADD COLUMN     "device" TEXT,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "os" TEXT,
ADD COLUMN     "utm_campaign" TEXT,
ADD COLUMN     "utm_content" TEXT,
ADD COLUMN     "utm_medium" TEXT,
ADD COLUMN     "utm_source" TEXT,
ADD COLUMN     "utm_term" TEXT;

-- CreateTable
CREATE TABLE "mwit-link_tiny"."admin_logs" (
    "id" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "action" "mwit-link_tiny"."AdminAction" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "admin_logs_adminId_idx" ON "mwit-link_tiny"."admin_logs"("adminId");

-- CreateIndex
CREATE INDEX "admin_logs_action_idx" ON "mwit-link_tiny"."admin_logs"("action");

-- CreateIndex
CREATE INDEX "admin_logs_entityType_idx" ON "mwit-link_tiny"."admin_logs"("entityType");

-- CreateIndex
CREATE INDEX "admin_logs_createdAt_idx" ON "mwit-link_tiny"."admin_logs"("createdAt");

-- CreateIndex
CREATE INDEX "link_analytics_linkId_idx" ON "mwit-link_tiny"."link_analytics"("linkId");

-- CreateIndex
CREATE INDEX "link_analytics_clickedAt_idx" ON "mwit-link_tiny"."link_analytics"("clickedAt");

-- AddForeignKey
ALTER TABLE "mwit-link_tiny"."admin_logs" ADD CONSTRAINT "admin_logs_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "mwit-link_tiny"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
