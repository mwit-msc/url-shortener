-- CreateEnum
CREATE TYPE "mwit-link_tiny"."AbuseReportType" AS ENUM ('SPAM', 'MALWARE', 'ILLEGAL', 'COPYRIGHT', 'HARASSMENT', 'ADULT_CONTENT', 'SCAM', 'OTHER');

-- CreateEnum
CREATE TYPE "mwit-link_tiny"."AbuseReportStatus" AS ENUM ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "mwit-link_tiny"."abuse_reports" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "reporterIp" TEXT,
    "reporterEmail" TEXT,
    "reportType" "mwit-link_tiny"."AbuseReportType" NOT NULL,
    "description" TEXT,
    "status" "mwit-link_tiny"."AbuseReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abuse_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "mwit-link_tiny"."abuse_reports" ADD CONSTRAINT "abuse_reports_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "mwit-link_tiny"."links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
