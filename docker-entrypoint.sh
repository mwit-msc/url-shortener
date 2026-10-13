#!/bin/sh
set -eu

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is required; refusing to start without migrations." >&2
  exit 64
fi

# Adopt verified pre-existing schemas, then deploy only pending migrations.
# The runner never resets the database or uses db push/accept-data-loss.
bun /app/scripts/migrate.mjs

exec "$@"
