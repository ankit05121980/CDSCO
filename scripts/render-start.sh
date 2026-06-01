#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

export NODE_ENV=production
export PORT="${PORT:-10000}"

if [ ! -f "${DB_PATH:-backend/ddrs.sqlite}" ] || [ "${SEED_ON_START:-false}" = "true" ]; then
  pnpm seed
fi

exec node backend/dist/main.js
