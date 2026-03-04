\echo '=== MANAGER: department phase/status snapshot ==='
SELECT
  department_id,
  phase,
  capital_allocated,
  total_pnl,
  consecutive_miss_days,
  status_updated
FROM department_status
ORDER BY department_id;

\echo '=== MANAGER: pending capital requests ==='
SELECT
  request_id,
  timestamp_utc,
  department_id,
  requested_amount,
  currency,
  approved_by_manager,
  requires_max_approval,
  status
FROM capital_requests
WHERE status = 'pending'
ORDER BY timestamp_utc ASC;

\echo '=== MANAGER: unresolved alerts requiring escalation ==='
SELECT
  timestamp_utc,
  source_agent,
  severity,
  title,
  detail,
  target
FROM alerts_log
WHERE acknowledged = FALSE
ORDER BY
  CASE severity WHEN 'critical' THEN 1 WHEN 'warning' THEN 2 ELSE 3 END,
  timestamp_utc DESC;

\echo '=== MANAGER: latest intelligence brief ==='
SELECT
  timestamp_utc,
  brief_type,
  market_bias,
  key_events,
  notable_signals,
  sent_to_manager
FROM market_briefs
ORDER BY timestamp_utc DESC
LIMIT 1;

\echo '=== MANAGER: dev queue rollup ==='
SELECT
  priority,
  status,
  COUNT(*) AS tasks
FROM dev_tasks
GROUP BY priority, status
ORDER BY
  CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
  status;
