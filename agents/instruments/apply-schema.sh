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

base_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
schema_file="$base_dir/../supabase_schema.sql"

psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -f "$schema_file"
