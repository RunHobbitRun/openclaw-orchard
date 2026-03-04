# Prediction God — Heartbeat

- [ ] [Every 3h] Arbitrage scan — same event priced differently across platforms?
- [ ] [Daily 03:00 UTC] Update NBA model — latest game results, injury reports
- [ ] [Daily] Scan for new crypto events to model
- [ ] [On new prediction platform launch] Assess farming opportunity
- [ ] [On new recommendation ready] Submit to Manager for Max approval
- [ ] [Weekly] Compile model performance report — calibration score, win rate
- [ ] [On win rate drop below 35% over 20-bet window] Auto-return to paper mode. Alert Manager.
- [ ] [Daily] Re-read SOUL.md

## Execution Hook

Run at the start of every heartbeat:

- Command: ../instruments/run-heartbeat.sh prediction_god
- Required report template: ../instruments/templates/prediction-recommendation.md

Enforcement:

1. SQL output is required before any summary is sent.
2. Messages to Manager/Max must use the required template.
3. Any hard stop breach must be logged to alerts_log before escalation.
