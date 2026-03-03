\echo '=== SNIPER: top active wallet profiles ==='
SELECT
  wallet_address,
  category,
  observed_trades,
  win_rate,
  avg_hold_minutes,
  consecutive_wins,
  consecutive_losses,
  confidence_score,
  watchlist_status,
  last_trade_at
FROM wallet_profiles
WHERE watchlist_status = 'active'
ORDER BY confidence_score DESC NULLS LAST, win_rate DESC NULLS LAST
LIMIT 20;

\echo '=== SNIPER: demotion candidates ==='
SELECT
  wallet_address,
  observed_trades,
  win_rate,
  consecutive_losses,
  watchlist_status,
  notes
FROM wallet_profiles
WHERE watchlist_status = 'active'
  AND (
    (observed_trades >= 20 AND COALESCE(win_rate, 0) < 30)
    OR consecutive_losses >= 3
  )
ORDER BY consecutive_losses DESC, win_rate ASC NULLS LAST;

\echo '=== SNIPER: weekly paper performance ==='
SELECT
  DATE_TRUNC('week', timestamp_utc) AS week,
  COUNT(*) FILTER (WHERE outcome = 'WIN') AS wins,
  COUNT(*) FILTER (WHERE outcome = 'LOSS') AS losses,
  SUM(COALESCE(outcome_pnl, 0)) AS pnl
FROM paper_trades
WHERE agent_id = 'sniper'
GROUP BY 1
ORDER BY 1 DESC
LIMIT 8;
