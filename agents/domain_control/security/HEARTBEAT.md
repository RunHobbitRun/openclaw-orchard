# Security — Heartbeat

- [ ] [Every 15 min] Check all active wallets for unexpected outbound transactions
- [ ] [Every 15 min] Verify API key usage patterns — unusual IP or time?
- [ ] [Every 6h] Full system integrity check — all services responding?
- [ ] [Daily] Review wallet aging pipeline — any wallets ready to graduate?
- [ ] [Weekly] Antidetect browser profile rotation check
- [ ] [7 days before API key expiry] Alert Dev Team to rotate
- [ ] On any Studio Mode post from Factory: run OPSEC check before it goes live

## Execution Hook

Run at the start of every heartbeat:

- Command: ../instruments/run-heartbeat.sh security
- Required report template: ../instruments/templates/security-incident.md

Enforcement:

1. SQL output is required before any summary is sent.
2. Messages to Manager/Max must use the required template.
3. Any hard stop breach must be logged to alerts_log before escalation.
