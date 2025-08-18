-- CreateEnum
CREATE TYPE "mwit-link_tiny"."UserRole" AS ENUM ('USER', 'SPECIAL_USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "mwit-link_tiny"."CustomRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "mwit-link_tiny"."accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mwit-link_tiny"."sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mwit-link_tiny"."users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "mwit-link_tiny"."UserRole" NOT NULL DEFAULT 'USER',
    "linkLimit" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mwit-link_tiny"."verificationtokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "mwit-link_tiny"."domains" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mwit-link_tiny"."links" (
    "id" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "domainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCustom" BOOLEAN NOT NULL DEFAULT false,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3),

    CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mwit-link_tiny"."custom_link_requests" (
    "id" TEXT NOT NULL,
    "shortCode" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "domainId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "mwit-link_tiny"."CustomRequestStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "custom_link_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mwit-link_tiny"."link_analytics" (
    "id" TEXT NOT NULL,
    "linkId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referer" TEXT,
    "country" TEXT,
    "city" TEXT,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "link_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "mwit-link_tiny"."accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "mwit-link_tiny"."sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "mwit-link_tiny"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_token_key" ON "mwit-link_tiny"."verificationtokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtokens_identifier_token_key" ON "mwit-link_tiny"."verificationtokens"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "domains_domain_key" ON "mwit-link_tiny"."domains"("domain");

-- CreateIndex
CREATE UNIQUE INDEX "links_shortCode_domainId_key" ON "mwit-link_tiny"."links"("shortCode", "domainId");

-- AddForeignKey
ALTER TABLE "mwit-link_tiny"."accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "mwit-link_tiny"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mwit-link_tiny"."sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "mwit-link_tiny"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mwit-link_tiny"."links" ADD CONSTRAINT "links_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "mwit-link_tiny"."domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mwit-link_tiny"."links" ADD CONSTRAINT "links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "mwit-link_tiny"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mwit-link_tiny"."custom_link_requests" ADD CONSTRAINT "custom_link_requests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "mwit-link_tiny"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mwit-link_tiny"."link_analytics" ADD CONSTRAINT "link_analytics_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "mwit-link_tiny"."links"("id") ON DELETE CASCADE ON UPDATE CASCADE;
