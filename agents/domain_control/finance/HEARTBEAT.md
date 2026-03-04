# Finance — Heartbeat

Run every 15 minutes.

- [ ] Reserve balance — check against floor threshold. Alert Auditor if below 120%.
- [ ] Any pending Manager capital requests — process within 1 heartbeat cycle
- [ ] Any department hard stop triggered — log capital freeze for that department
- [ ] [07:00 UTC] Compile and send Daily Report to Max
- [ ] [Monday 10:00 UTC] Compile Weekly Settlement, send to Max for manual confirmation
- [ ] [1st of month] Full capital allocation review, send to Max with Manager

## Execution Hook

Run at the start of every heartbeat:

- Command: ../instruments/run-heartbeat.sh finance
- Required report template: ../instruments/templates/finance-daily-report.md

Enforcement:

1. SQL output is required before any summary is sent.
2. Messages to Manager/Max must use the required template.
3. Any hard stop breach must be logged to alerts_log before escalation.
