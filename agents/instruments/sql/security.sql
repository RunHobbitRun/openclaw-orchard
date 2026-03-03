\echo '=== SECURITY: wallet readiness by age and status ==='
SELECT
  wallet_address,
  chain,
  department,
  created_date,
  age_days,
  status,
  proxy_assigned,
  last_activity
FROM wallet_registry
ORDER BY age_days DESC, department;

\echo '=== SECURITY: wallets marked compromised ==='
SELECT
  wallet_address,
  chain,
  department,
  status,
  notes,
  last_activity
FROM wallet_registry
WHERE status = 'compromised'
ORDER BY last_activity DESC NULLS LAST;

\echo '=== SECURITY: unapproved executions with wallet IDs (last 24 hours) ==='
SELECT
  timestamp_utc,
  agent_id,
  stream,
  wallet_id,
  risk_approval_id,
  payload
FROM trade_ledger
WHERE timestamp_utc >= NOW() - INTERVAL '24 hours'
  AND event_type = 'EXECUTION'
  AND wallet_id IS NOT NULL
  AND COALESCE(risk_approval_id, '') = ''
ORDER BY timestamp_utc DESC;

\echo '=== SECURITY: open critical alerts ==='
SELECT
  timestamp_utc,
  source_agent,
  severity,
  title,
  detail,
  target
FROM alerts_log
WHERE acknowledged = FALSE
  AND severity IN ('critical', 'warning')
ORDER BY timestamp_utc DESC;
