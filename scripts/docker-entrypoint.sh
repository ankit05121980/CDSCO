#!/usr/bin/env bash
set -euo pipefail
cd /app

export NODE_ENV=production
export PORT="${PORT:-10000}"
export DB_PATH="${DB_PATH:-/var/data/ddrs.sqlite}"

mkdir -p "$(dirname "$DB_PATH")"

if [ ! -f "$DB_PATH" ]; then
  if [ -f /app/backend/ddrs.sqlite ]; then
    cp /app/backend/ddrs.sqlite "$DB_PATH"
  else
    pnpm seed
    cp /app/backend/ddrs.sqlite "$DB_PATH" 2>/dev/null || true
  fi
fi

exec node backend/dist/main.js
