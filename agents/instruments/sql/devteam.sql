\echo '=== DEVTEAM: active queue ==='
SELECT
  priority,
  status,
  COUNT(*) AS tasks
FROM dev_tasks
GROUP BY priority, status
ORDER BY
  CASE priority WHEN 'critical' THEN 1 WHEN 'high' THEN 2 WHEN 'medium' THEN 3 ELSE 4 END,
  status;

\echo '=== DEVTEAM: blocked tasks ==='
SELECT
  timestamp_utc,
  title,
  department_id,
  priority,
  blocker,
  due_at
FROM dev_tasks
WHERE status = 'blocked'
ORDER BY timestamp_utc ASC;

\echo '=== DEVTEAM: completed in last 7 days ==='
SELECT
  DATE_TRUNC('day', completed_at) AS day,
  COUNT(*) AS completed
FROM dev_tasks
WHERE status = 'done'
  AND completed_at >= NOW() - INTERVAL '7 days'
GROUP BY 1
ORDER BY 1 DESC;

\echo '=== DEVTEAM: security-sensitive tasks (spec marker) ==='
SELECT
  title,
  department_id,
  priority,
  status,
  spec
FROM dev_tasks
WHERE COALESCE(spec->>'security_sensitive', 'false') = 'true'
ORDER BY timestamp_utc DESC;
