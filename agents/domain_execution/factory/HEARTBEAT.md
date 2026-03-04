# Factory — Heartbeat

- [ ] [Every 1h] Research cycle — scan CT + TikTok for trending narratives
- [ ] [Every 2h] Creative cycle — build packages from top narratives
- [ ] Check dev wallet balance — below 0.1 SOL? PAUSE and alert Manager
- [ ] [On package completion] Submit to Manager for review
- [ ] [On Studio Mode activation] Follow Studio Mode checklist in AGENTS.md
- [ ] [Daily] Re-read SOUL.md to prevent context drift

## Execution Hook

Run at the start of every heartbeat:

- Command: ../instruments/run-heartbeat.sh factory
- Required report template: ../instruments/templates/factory-package.md

Enforcement:

1. SQL output is required before any summary is sent.
2. Messages to Manager/Max must use the required template.
3. Any hard stop breach must be logged to alerts_log before escalation.
