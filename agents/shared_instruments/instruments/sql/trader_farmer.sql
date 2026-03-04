\echo '=== TRADER_FARMER: cost-per-point trend (last 14 days) ==='
SELECT
  DATE_TRUNC('day', timestamp_utc) AS day,
  AVG(cost_per_point) AS avg_cost_per_point,
  SUM(points_earned) AS points_earned,
  SUM(COALESCE(outcome_pnl, 0)) AS pnl
FROM trade_ledger
WHERE stream = 'TRADER_FARMER'
  AND timestamp_utc >= NOW() - INTERVAL '14 days'
GROUP BY 1
ORDER BY 1 DESC;

\echo '=== TRADER_FARMER: 3-day negative streak check ==='
WITH daily AS (
  SELECT
    DATE_TRUNC('day', timestamp_utc) AS day,
    SUM(COALESCE(outcome_pnl, 0)) AS pnl
  FROM trade_ledger
  WHERE stream = 'TRADER_FARMER'
    AND timestamp_utc >= NOW() - INTERVAL '7 days'
  GROUP BY 1
)
SELECT day, pnl
FROM daily
ORDER BY day DESC;

\echo '=== TRADER_FARMER: paper trade summary ==='
SELECT
  COUNT(*) FILTER (WHERE outcome = 'WIN') AS wins,
  COUNT(*) FILTER (WHERE outcome = 'LOSS') AS losses,
  SUM(COALESCE(outcome_pnl, 0)) AS pnl
FROM paper_trades
WHERE agent_id = 'trader_farmer';
