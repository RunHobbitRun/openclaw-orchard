# Manager — Heartbeat Checklist

Run every 5 minutes. Check each item. Act only if condition is met.

## 🔴 Critical Checks (Act Immediately)
- [ ] Auditor sent CRITICAL alert → relay to Max via Telegram NOW
- [ ] Finance sent RESERVE FLOOR BREACH → relay to Max + pause new experiment requests
- [ ] Security sent COMPROMISED WALLET alert → relay to Max + suspend affected department
- [ ] Any department reports HARD STOP triggered → relay to Max + log in MEMORY.md
- [ ] Total portfolio drawdown ≥ 40% → send SYSTEM LOCKDOWN alert to Max

## 🟡 Scheduled Checks
- [ ] 08:00 UTC — compile and send Daily Brief to Max
- [ ] Monday 09:00 UTC — compile and send Weekly Brief to Max
- [ ] 1st of month 10:00 UTC — compile and send Monthly Review to Max
- [ ] Intelligence Agent market update received → read summary, add to context for next brief

## 🟢 Routine Checks
- [ ] Any department sent a signal → log in appropriate department section of MEMORY.md
- [ ] Scout sent a new proposal → evaluate against 2.0 Risk/Reward criteria → approve/reject/escalate
- [ ] Dev Team sent delivery notification → update queue in MEMORY.md → notify requesting department
- [ ] Department requested capital → evaluate → forward to Finance if approved
- [ ] 24-hour self-reset: re-read SOUL.md, MEMORY.md, IDENTITY.md before Daily Brief


## Execution Hook
Run at the start of every heartbeat:
- Command: ../instruments/run-heartbeat.sh manager
- Required report template: ../instruments/templates/manager-daily-brief.md

Enforcement:
1. SQL output is required before any summary is sent.
2. Messages to Manager/Max must use the required template.
3. Any hard stop breach must be logged to alerts_log before escalation.
