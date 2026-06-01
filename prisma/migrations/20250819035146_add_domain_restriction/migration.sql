-- CreateEnum
CREATE TYPE "DomainRestriction" AS ENUM ('EVERYONE', 'ADMIN_ONLY', 'SPECIFIC_USERS');

-- AlterTable
ALTER TABLE "domains" ADD COLUMN     "restriction" "DomainRestriction" NOT NULL DEFAULT 'EVERYONE';

-- CreateTable
CREATE TABLE "domain_allowed_users" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "domain_allowed_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "domain_allowed_users_domainId_userId_key" ON "domain_allowed_users"("domainId", "userId");

-- AddForeignKey
ALTER TABLE "domain_allowed_users" ADD CONSTRAINT "domain_allowed_users_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_allowed_users" ADD CONSTRAINT "domain_allowed_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
