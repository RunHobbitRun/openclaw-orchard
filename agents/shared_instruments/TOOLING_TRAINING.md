# Agent Tooling Training

Use this procedure to train each agent to use instruments correctly.

## 1. Bootstrap (once)

```bash
cd openclaw/agents/instruments
export SUPABASE_DB_URL='postgresql://...'
./apply-schema.sh
```

Set thresholds after schema load:

```bash
RESERVE_FLOOR=1500 MAX_DRAWDOWN=0.40 LOOP_ACTIONS_PER_MINUTE=10 ./set-thresholds.sh
```

## 2. Per-heartbeat Execution

1. Run the role query pack and template selector (`./run-heartbeat.sh <agent_name>`).
2. Read only the high-signal rows (breaches, pending items, status changes).
3. Populate the template path returned by `run-heartbeat.sh`.
4. Send summary to Manager or Max based on authority.

Example:

```bash
./run-heartbeat.sh auditor
# then fill templates/auditor-critical-alert.md if any threshold is breached
```

## 3. Escalation Rules

- `critical`: send immediately, no batching.
- `warning`: include in next scheduled brief unless it is compounding.
- `info`: log only, no interrupt.

Always write an `alerts_log` row for `critical` or `warning` before messaging.

## 4. Quality Bar

- Reports must include a metric, a threshold, and a required action.
- No raw dumps to leadership; summarize impact in one decision sentence.
- If data is missing, mark status as `UNCONFIGURED` instead of guessing.

## 5. Weekly Drills

1. Run all packs once (`auditor`, `manager`, `finance`, `security`, execution agents).
2. Validate templates can be filled from current data without manual guesswork.
3. Open a `dev_tasks` item for any missing field/table/automation.
