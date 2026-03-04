# Sniper — Heartbeat

- [ ] [Every 2h] Research cycle — scan target wallet categories via Helius RPC
- [ ] [Daily] Update wallet profiles — win rates, patterns, hold times
- [ ] [Monday] Compile weekly watchlist report for Manager
- [ ] [On AK.pro result received] Update wallet profile, recalculate accuracy
- [ ] [On wallet hitting hard stop] Remove from watchlist immediately, alert Manager
- [ ] [On Factory STUDIO NOTICE] Prepare pre-positioning recommendation within 2 hours
- [ ] [Daily] Re-read SOUL.md

## Execution Hook

Run at the start of every heartbeat:

- Command: ../instruments/run-heartbeat.sh sniper
- Required report template: ../instruments/templates/sniper-watchlist.md

Enforcement:

1. SQL output is required before any summary is sent.
2. Messages to Manager/Max must use the required template.
3. Any hard stop breach must be logged to alerts_log before escalation.
