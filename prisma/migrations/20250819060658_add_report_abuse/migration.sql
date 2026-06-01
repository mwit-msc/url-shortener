-- CreateEnum
CREATE TYPE "AbuseReportType" AS ENUM ('SPAM', 'MALWARE', 'ILLEGAL', 'COPYRIGHT', 'HARASSMENT', 'ADULT_CONTENT', 'SCAM', 'OTHER');

-- CreateEnum
CREATE TYPE "AbuseReportStatus" AS ENUM ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "abuse_reports" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "reporterIp" TEXT,
    "reporterEmail" TEXT,
    "reportType" "AbuseReportType" NOT NULL,
    "description" TEXT,
    "status" "AbuseReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "abuse_reports_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "abuse_reports" ADD CONSTRAINT "abuse_reports_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
