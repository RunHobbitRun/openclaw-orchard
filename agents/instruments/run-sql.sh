#!/usr/bin/env bash
set -euo pipefail

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_DB_URL is not set"
  exit 1
fi

if [[ "$SUPABASE_DB_URL" == *"[YOUR-PASSWORD]"* ]]; then
  echo "SUPABASE_DB_URL still contains [YOUR-PASSWORD] placeholder"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "psql is not installed. Install PostgreSQL client or run this on a host with psql."
  exit 1
fi

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <query-pack>"
  echo "Example: $0 manager"
  exit 1
fi

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
QUERY_FILE="$BASE_DIR/sql/$1.sql"

if [[ ! -f "$QUERY_FILE" ]]; then
  echo "Query pack not found: $QUERY_FILE"
  echo "Available packs:"
  ls -1 "$BASE_DIR/sql" | sed 's/\.sql$//'
  exit 1
fi

psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$QUERY_FILE"
