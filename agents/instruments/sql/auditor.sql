\echo '=== AUDITOR: loop detection (last 60 seconds) ==='
WITH cfg AS (
  SELECT COALESCE((SELECT value_num::INT FROM system_thresholds WHERE metric = 'loop_actions_per_minute'), 10) AS loop_limit
)
SELECT
  a.agent_id,
  a.action_type,
  COUNT(*) AS action_count,
  MIN(a.timestamp_utc) AS first_seen,
  MAX(a.timestamp_utc) AS last_seen
FROM agent_actions a
CROSS JOIN cfg
WHERE a.timestamp_utc >= NOW() - INTERVAL '60 seconds'
GROUP BY a.agent_id, a.action_type, cfg.loop_limit
HAVING COUNT(*) >= cfg.loop_limit
ORDER BY action_count DESC;

\echo '=== AUDITOR: unapproved executions (last 24 hours) ==='
SELECT
  timestamp_utc,
  agent_id,
  stream,
  event_type,
  wallet_id,
  risk_approval_id,
  payload
FROM trade_ledger
WHERE timestamp_utc >= NOW() - INTERVAL '24 hours'
  AND event_type = 'EXECUTION'
  AND COALESCE(risk_approval_id, '') = ''
ORDER BY timestamp_utc DESC
LIMIT 50;

\echo '=== AUDITOR: drawdown hard-stop check ==='
WITH cfg AS (
  SELECT COALESCE((SELECT value_num FROM system_thresholds WHERE metric = 'max_drawdown'), 0.40) AS max_drawdown
), latest AS (
  SELECT timestamp_utc, total_capital, drawdown_from_peak
  FROM portfolio_state
  ORDER BY timestamp_utc DESC
  LIMIT 1
)
SELECT
  l.timestamp_utc,
  l.total_capital,
  l.drawdown_from_peak,
  c.max_drawdown,
  CASE WHEN l.drawdown_from_peak >= c.max_drawdown THEN 'LOCKDOWN' ELSE 'OK' END AS status
FROM latest l
CROSS JOIN cfg c;

\echo '=== AUDITOR: reserve floor breach check ==='
WITH cfg AS (
  SELECT COALESCE((SELECT value_num FROM system_thresholds WHERE metric = 'reserve_floor'), 0) AS reserve_floor
), latest AS (
  SELECT timestamp_utc, reserve_bucket
  FROM portfolio_state
  ORDER BY timestamp_utc DESC
  LIMIT 1
)
SELECT
  l.timestamp_utc,
  l.reserve_bucket,
  c.reserve_floor,
  (c.reserve_floor * 1.2) AS breach_threshold,
  CASE
    WHEN c.reserve_floor = 0 THEN 'UNCONFIGURED'
    WHEN l.reserve_bucket < c.reserve_floor * 1.2 THEN 'BREACH'
    ELSE 'OK'
  END AS reserve_status
FROM latest l
CROSS JOIN cfg c;

\echo '=== AUDITOR: unacknowledged critical alerts ==='
SELECT timestamp_utc, source_agent, severity, title, target
FROM alerts_log
WHERE acknowledged = FALSE
  AND severity = 'critical'
ORDER BY timestamp_utc DESC;
