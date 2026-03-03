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

reserve_floor="${RESERVE_FLOOR:-1500}"
max_drawdown="${MAX_DRAWDOWN:-0.40}"
loop_actions="${LOOP_ACTIONS_PER_MINUTE:-10}"

psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 <<SQL
INSERT INTO system_thresholds (metric, value_num, value_text, updated_by)
VALUES
  ('reserve_floor', ${reserve_floor}, 'Reserve floor in base currency', 'operator'),
  ('max_drawdown', ${max_drawdown}, 'Hard-stop drawdown ratio', 'operator'),
  ('loop_actions_per_minute', ${loop_actions}, 'Loop detector threshold', 'operator')
ON CONFLICT (metric)
DO UPDATE SET
  value_num = EXCLUDED.value_num,
  value_text = EXCLUDED.value_text,
  updated_at = NOW(),
  updated_by = EXCLUDED.updated_by;
SQL

psql "$SUPABASE_DB_URL" -v ON_ERROR_STOP=1 -c "SELECT metric, value_num, value_text, updated_at, updated_by FROM system_thresholds ORDER BY metric;"
