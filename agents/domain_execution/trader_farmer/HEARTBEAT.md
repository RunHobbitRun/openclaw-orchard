# Trader Farmer — Heartbeat

- [ ] [Every 4h] Recalculate cost-per-point for active protocols — still above 2.0x?
- [ ] [Every 6h] Check funding rates on delta-neutral pairs — exceeding 0.3%/day? Rotate.
- [ ] [Daily] Log simulated trade performance to Supabase
- [ ] [Daily] Check vault yield vs farming cost ratio — below 40%? Alert Manager.
- [ ] [Weekly] Compile farming performance report for Manager
- [ ] [On Sybil flag detection] Alert Security immediately. Isolate wallet.
- [ ] [On 3-day negative ROI] Pause strategy. Alert Manager.

## Execution Hook

Run at the start of every heartbeat:

- Command: ../instruments/run-heartbeat.sh trader_farmer
- Required report template: ../instruments/templates/trader-farmer-report.md

Enforcement:

1. SQL output is required before any summary is sent.
2. Messages to Manager/Max must use the required template.
3. Any hard stop breach must be logged to alerts_log before escalation.
