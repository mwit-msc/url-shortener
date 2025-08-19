-- CreateEnum
CREATE TYPE "mwit-link_tiny"."DomainRestriction" AS ENUM ('EVERYONE', 'ADMIN_ONLY', 'SPECIFIC_USERS');

-- AlterTable
ALTER TABLE "mwit-link_tiny"."domains" ADD COLUMN     "restriction" "mwit-link_tiny"."DomainRestriction" NOT NULL DEFAULT 'EVERYONE';

-- CreateTable
CREATE TABLE "mwit-link_tiny"."domain_allowed_users" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "domain_allowed_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "domain_allowed_users_domainId_userId_key" ON "mwit-link_tiny"."domain_allowed_users"("domainId", "userId");

-- AddForeignKey
ALTER TABLE "mwit-link_tiny"."domain_allowed_users" ADD CONSTRAINT "domain_allowed_users_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "mwit-link_tiny"."domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mwit-link_tiny"."domain_allowed_users" ADD CONSTRAINT "domain_allowed_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "mwit-link_tiny"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
