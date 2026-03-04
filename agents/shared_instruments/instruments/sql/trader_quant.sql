\echo '=== TRADER_QUANT: strategy pipeline ==='
SELECT
  stage,
  COUNT(*) AS strategies,
  AVG(sharpe_ratio) AS avg_sharpe,
  AVG(max_drawdown) AS avg_max_drawdown,
  AVG(win_rate) AS avg_win_rate
FROM strategy_candidates
GROUP BY stage
ORDER BY
  CASE stage
    WHEN 'research' THEN 1
    WHEN 'backtest' THEN 2
    WHEN 'paper' THEN 3
    WHEN 'approved' THEN 4
    WHEN 'rejected' THEN 5
    ELSE 9
  END;

\echo '=== TRADER_QUANT: backtest pass candidates ==='
SELECT
  strategy_name,
  market,
  sharpe_ratio,
  max_drawdown,
  win_rate,
  profit_factor,
  stage,
  timestamp_utc
FROM strategy_candidates
WHERE sharpe_ratio > 1.0
  AND max_drawdown < 0.25
ORDER BY timestamp_utc DESC;

\echo '=== TRADER_QUANT: live drawdown alert signals ==='
SELECT
  timestamp_utc,
  strategy,
  outcome_pnl,
  payload
FROM trade_ledger
WHERE stream = 'TRADER_QUANT'
  AND event_type = 'ALERT'
ORDER BY timestamp_utc DESC
LIMIT 50;
