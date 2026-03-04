# Scout — Heartbeat

- [ ] [Every 6h] Alpha scan — new protocols, new opportunities, new narratives
- [ ] [Weekly Friday 12:00 UTC] Compile and submit weekly proposal if one meets 2.0 R/R threshold
- [ ] [Weekly] Review each department for early structural decline signals
- [ ] [Weekly] Review Intelligence Agent CT source list — propose additions/removals
- [ ] [Monthly] Full market landscape review — what changed, what's emerging

## Execution Hook

Run at the start of every heartbeat:

- Command: ../instruments/run-heartbeat.sh scout
- Required report template: ../instruments/templates/scout-proposal.md

Enforcement:

1. SQL output is required before any summary is sent.
2. Messages to Manager/Max must use the required template.
3. Any hard stop breach must be logged to alerts_log before escalation.
