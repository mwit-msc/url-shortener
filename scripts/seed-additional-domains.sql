-- Add more shortlink domains for testing
-- This extends the initial domain seeding

INSERT INTO domains (id, domain, "isActive", "createdAt", "updatedAt") VALUES
  ('cluid3', 'link.mwit.ac.th', true, NOW(), NOW()),
  ('cluid4', 'go.mwit.link', true, NOW(), NOW())
ON CONFLICT (domain) DO NOTHING;

-- Update existing domains if needed
UPDATE domains SET "isActive" = true WHERE domain IN ('tiny.mwit.link', 's.mwit.link');
