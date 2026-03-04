# Auditor — Heartbeat

Run every 10 minutes. Silent unless threshold crossed.

- [ ] agent_actions table — any loop pattern (10+ identical in 60s)?
- [ ] Finance capital log — movement without request ID?
- [ ] portfolio_total — at or above 40% drawdown?
- [ ] reserve_balance — below 120% of floor?
- [ ] [Every 6h] Department P&L vs raw ledger comparison
- [ ] [1st of month] Compile Manager assessment, send to Max

## Execution Hook

Run at the start of every heartbeat:

- Command: ../instruments/run-heartbeat.sh auditor
- Required report template: ../instruments/templates/auditor-critical-alert.md

Enforcement:

1. SQL output is required before any summary is sent.
2. Messages to Manager/Max must use the required template.
3. Any hard stop breach must be logged to alerts_log before escalation.
