-- Additive migration: existing users, domains, and links remain untouched.
CREATE TABLE "qr_generator_config" (
    "id" TEXT NOT NULL DEFAULT 'default',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "generatorUrl" TEXT NOT NULL DEFAULT '',
    "options" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "qr_generator_config_pkey" PRIMARY KEY ("id")
);
