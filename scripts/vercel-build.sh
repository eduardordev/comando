#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

npm run build --prefix shared
npm run db:generate --prefix server
npm run build --prefix server

if [ -n "${TURSO_DATABASE_URL:-}" ] && [ -n "${TURSO_AUTH_TOKEN:-}" ]; then
  echo "Aplicando migraciones en Turso..."
  npm run db:migrate:turso --prefix server
else
  echo "TURSO_* no configurado en build; omitiendo migraciones remotas."
fi

npm run build --prefix client
