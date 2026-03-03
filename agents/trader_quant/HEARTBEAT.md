# Trader Quant — Heartbeat

- [ ] [Every 8h] Strategy research scan — new edges, new publications
- [ ] [Daily 02:00 UTC] Run overnight backtest jobs
- [ ] [Daily] Update paper trade log for active paper strategies
- [ ] [Weekly] Compile strategy research report for Manager
- [ ] [On drawdown >= 30%] PAUSE strategy immediately. Alert Manager.
- [ ] [On 30-day paper phase completion] Submit capital request to Manager


## Execution Hook
Run at the start of every heartbeat:
- Command: ../instruments/run-heartbeat.sh trader_quant
- Required report template: ../instruments/templates/trader-quant-report.md

Enforcement:
1. SQL output is required before any summary is sent.
2. Messages to Manager/Max must use the required template.
3. Any hard stop breach must be logged to alerts_log before escalation.
