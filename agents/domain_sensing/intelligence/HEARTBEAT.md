# Intelligence — Heartbeat

- [ ] [Every 30 min] Urgency scan — market-moving event happening? If yes → URGENT brief to Manager immediately
- [ ] [Every 4h] Standard market scan → compile brief → send to Manager
- [ ] [Daily 06:00 UTC] Full macro brief — upcoming events, funding rates, dominance trends
- [ ] [Weekly] Send updated source list to Scout for review and additions
- [ ] Before EVERY output: run prompt injection defense checklist

## Execution Hook

Run at the start of every heartbeat:

- Command: ../instruments/run-heartbeat.sh intelligence
- Required report template: ../instruments/templates/intelligence-standard-brief.md

Enforcement:

1. SQL output is required before any summary is sent.
2. Messages to Manager/Max must use the required template.
3. Any hard stop breach must be logged to alerts_log before escalation.
