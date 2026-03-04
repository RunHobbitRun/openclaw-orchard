\echo '=== INTELLIGENCE: latest brief history ==='
SELECT
  timestamp_utc,
  brief_type,
  market_bias,
  sent_to_manager,
  key_events,
  notable_signals
FROM market_briefs
ORDER BY timestamp_utc DESC
LIMIT 12;

\echo '=== INTELLIGENCE: urgent briefs not sent to manager ==='
SELECT
  timestamp_utc,
  brief_type,
  market_bias,
  payload
FROM market_briefs
WHERE brief_type = 'urgent'
  AND sent_to_manager = FALSE
ORDER BY timestamp_utc DESC;

\echo '=== INTELLIGENCE: source activity (from agent_actions) ==='
SELECT
  action_type,
  COUNT(*) AS events,
  MAX(timestamp_utc) AS last_seen
FROM agent_actions
WHERE agent_id = 'intelligence'
  AND timestamp_utc >= NOW() - INTERVAL '7 days'
GROUP BY action_type
ORDER BY events DESC;
