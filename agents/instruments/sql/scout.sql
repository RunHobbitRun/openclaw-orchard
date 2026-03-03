\echo '=== SCOUT: fresh alpha submissions (last 14 days) ==='
SELECT
  timestamp_utc,
  title,
  tags,
  useful_to,
  LEFT(content, 240) AS summary
FROM company_wiki
WHERE author_agent = 'scout'
  AND category = 'ALPHA'
  AND timestamp_utc >= NOW() - INTERVAL '14 days'
ORDER BY timestamp_utc DESC;

\echo '=== SCOUT: departments at risk (warning/decline) ==='
SELECT
  department_id,
  phase,
  total_pnl,
  consecutive_miss_days,
  status_updated
FROM department_status
WHERE phase IN ('warning', 'closed') OR consecutive_miss_days >= 14
ORDER BY consecutive_miss_days DESC, status_updated DESC;

\echo '=== SCOUT: proposal coverage by department (30 days) ==='
SELECT
  unnest(useful_to) AS department,
  COUNT(*) AS proposals
FROM company_wiki
WHERE author_agent = 'scout'
  AND category = 'ALPHA'
  AND timestamp_utc >= NOW() - INTERVAL '30 days'
GROUP BY 1
ORDER BY proposals DESC;
