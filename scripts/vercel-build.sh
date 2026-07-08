#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

npm run build --prefix shared
npm run db:generate --prefix server
npm run build --prefix client
