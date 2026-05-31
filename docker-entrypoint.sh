#!/bin/sh
set -e

# Seed the database on first boot (SQLite: when the file is missing;
# PostgreSQL / any DB: when SEED_ON_START=true).
if [ "${SEED_ON_START}" = "true" ]; then
  echo "[DDRS] SEED_ON_START=true — seeding database..."
  pnpm --filter backend seed
elif [ "${DB_TYPE:-sqlite}" = "sqlite" ] && [ ! -f "${DB_PATH:-/app/data/ddrs.sqlite}" ]; then
  echo "[DDRS] No database found at ${DB_PATH:-/app/data/ddrs.sqlite} — seeding..."
  pnpm --filter backend seed
else
  echo "[DDRS] Existing database detected — skipping seed."
fi

echo "[DDRS] Starting server on port ${PORT:-3001}..."
exec node backend/dist/main.js
