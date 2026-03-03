\echo '=== PREDICTION_GOD: rolling 20-bet win rate ==='
WITH recent AS (
  SELECT outcome
  FROM paper_trades
  WHERE agent_id = 'prediction_god'
    AND outcome IN ('WIN', 'LOSS')
  ORDER BY timestamp_utc DESC
  LIMIT 20
)
SELECT
  COUNT(*) AS bets,
  COUNT(*) FILTER (WHERE outcome = 'WIN') AS wins,
  ROUND(
    100.0 * COUNT(*) FILTER (WHERE outcome = 'WIN') / NULLIF(COUNT(*), 0),
    2
  ) AS win_rate_pct
FROM recent;

\echo '=== PREDICTION_GOD: calibration drift ==='
SELECT
  COUNT(*) AS resolved_bets,
  ROUND(AVG(ABS(COALESCE(my_probability, 0) - COALESCE(market_probability, 0))), 4) AS avg_prob_gap,
  SUM(COALESCE(outcome_pnl, 0)) AS pnl
FROM paper_trades
WHERE agent_id = 'prediction_god'
  AND outcome IN ('WIN', 'LOSS');

\echo '=== PREDICTION_GOD: latest signals ==='
SELECT
  timestamp_utc,
  strategy,
  confidence_score,
  payload
FROM trade_ledger
WHERE stream = 'PREDICTION'
  AND event_type IN ('SIGNAL', 'PLAN')
ORDER BY timestamp_utc DESC
LIMIT 20;
