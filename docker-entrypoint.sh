#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required; refusing to start without migrations." >&2
  exit 64
fi

# Deploy only committed migrations. Prisma tracks applied migrations and uses
# PostgreSQL advisory locking. A failed migration prevents the app from starting.
echo "Applying pending database migrations..."
bun /app/node_modules/prisma/build/index.js migrate deploy

exec "$@"
