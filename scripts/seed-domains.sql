-- Seed script to add the shortlink domains served by this app.
-- Run after migrations: psql "$DATABASE_URL" -f scripts/seed-domains.sql
-- Redirects resolve by matching the request Host header against domains.domain,
-- so every domain that points DNS at this app MUST have a row here.

INSERT INTO domains (id, domain, "isActive", restriction, "createdAt", "updatedAt") VALUES
  ('dom_tiny',  'tiny.mwit.link',  true, 'EVERYONE', NOW(), NOW()),
  ('dom_s',     's.mwit.link',     true, 'EVERYONE', NOW(), NOW()),
  ('dom_links', 'links.mwit.link', true, 'EVERYONE', NOW(), NOW())
ON CONFLICT (domain) DO UPDATE
  SET "isActive" = EXCLUDED."isActive",
      "updatedAt" = NOW();
