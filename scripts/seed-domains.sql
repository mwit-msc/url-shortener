-- Seed script to add default shortlink domains
-- This will be executed after the database is set up

INSERT INTO domains (id, domain, "isActive", "createdAt", "updatedAt") VALUES
  ('cluid1', 'tiny.mwit.link', true, NOW(), NOW()),
  ('cluid2', 's.mwit.link', true, NOW(), NOW())
ON CONFLICT (domain) DO NOTHING;
