# Dev Team — Heartbeat

- [ ] [Every 2h] Check task queue — any CRITICAL or HIGH priority tasks?
- [ ] [On task completion] Submit to Manager with test results for Max approval
- [ ] [Weekly] Update Tool Library in MEMORY.md
- [ ] [7 days before any API expiry flagged by Security] Rotate key, test, deploy
- [ ] [Monthly] Review Tool Library — anything deprecated or needing updates?

## Execution Hook

Run at the start of every heartbeat:

- Command: ../instruments/run-heartbeat.sh devteam
- Required report template: ../instruments/templates/devteam-delivery-note.md

Enforcement:

1. SQL output is required before any summary is sent.
2. Messages to Manager/Max must use the required template.
3. Any hard stop breach must be logged to alerts_log before escalation.
