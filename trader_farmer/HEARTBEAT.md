# Trader Farmer — Heartbeat

- [ ] [Every 4h] Recalculate cost-per-point for active protocols — still above 2.0x?
- [ ] [Every 6h] Check funding rates on delta-neutral pairs — exceeding 0.3%/day? Rotate.
- [ ] [Daily] Log simulated trade performance to Supabase
- [ ] [Daily] Check vault yield vs farming cost ratio — below 40%? Alert Manager.
- [ ] [Weekly] Compile farming performance report for Manager
- [ ] [On Sybil flag detection] Alert Security immediately. Isolate wallet.
- [ ] [On 3-day negative ROI] Pause strategy. Alert Manager.
