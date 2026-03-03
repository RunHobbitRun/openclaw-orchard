\echo '=== FACTORY: package throughput (last 14 days) ==='
SELECT
  DATE_TRUNC('day', timestamp_utc) AS day,
  COUNT(*) FILTER (WHERE event_type = 'PLAN') AS planned,
  COUNT(*) FILTER (WHERE event_type = 'EXECUTION') AS executed,
  COUNT(*) FILTER (WHERE event_type = 'OUTCOME') AS outcomes
FROM trade_ledger
WHERE stream = 'FACTORY'
  AND timestamp_utc >= NOW() - INTERVAL '14 days'
GROUP BY 1
ORDER BY 1 DESC;

\echo '=== FACTORY: latest narrative candidates ==='
SELECT
  timestamp_utc,
  event_type,
  strategy,
  confidence_score,
  payload
FROM trade_ledger
WHERE stream = 'FACTORY'
ORDER BY timestamp_utc DESC
LIMIT 20;

\echo '=== FACTORY: ready wallets ==='
SELECT
  wallet_address,
  age_days,
  status,
  last_activity
FROM wallet_registry
WHERE department IN ('factory', 'studio')
  AND status IN ('ready', 'active')
ORDER BY age_days DESC;
