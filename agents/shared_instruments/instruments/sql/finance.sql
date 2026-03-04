\echo '=== FINANCE: latest portfolio state ==='
SELECT
  timestamp_utc,
  total_capital,
  operations_bucket,
  reserve_bucket,
  personal_bucket,
  three_buckets_active,
  drawdown_from_peak
FROM portfolio_state
ORDER BY timestamp_utc DESC
LIMIT 1;

\echo '=== FINANCE: pending and overdue capital requests ==='
SELECT
  request_id,
  timestamp_utc,
  department_id,
  requested_amount,
  currency,
  status,
  EXTRACT(EPOCH FROM (NOW() - timestamp_utc)) / 60 AS age_minutes
FROM capital_requests
WHERE status = 'pending'
ORDER BY timestamp_utc ASC;

\echo '=== FINANCE: department statuses that restrict funding ==='
SELECT
  department_id,
  phase,
  capital_allocated,
  total_pnl,
  consecutive_miss_days,
  status_updated
FROM department_status
WHERE phase IN ('warning', 'closed')
ORDER BY status_updated DESC;

\echo '=== FINANCE: executed financial movements (last 24 hours) ==='
SELECT
  timestamp_utc,
  agent_id,
  event_type,
  stream,
  outcome_pnl,
  payload,
  risk_approval_id
FROM trade_ledger
WHERE timestamp_utc >= NOW() - INTERVAL '24 hours'
  AND stream = 'FINANCE'
ORDER BY timestamp_utc DESC;
