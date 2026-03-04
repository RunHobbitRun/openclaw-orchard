# Agent Instruments Kit

This directory turns agent instructions into repeatable operations.

## What is included

- `sql/*.sql`: role-specific checks and dashboards.
- `templates/*.md`: message formats for alerts, briefs, and proposals.
- `run-sql.sh`: helper to execute any SQL pack against Supabase.
- `run-heartbeat.sh`: executes role SQL pack and returns required report template.
- `apply-schema.sh`: applies `../supabase_schema.sql`.
- `set-thresholds.sh`: upserts `reserve_floor`, `max_drawdown`, `loop_actions_per_minute`.

## Quick Start

1. Apply schema once:
   ```bash
   ./apply-schema.sh
   ```
2. Export DB URL:
   ```bash
   export SUPABASE_DB_URL='postgresql://...'
   ```
3. Set threshold values:
   ```bash
   RESERVE_FLOOR=1500 MAX_DRAWDOWN=0.40 LOOP_ACTIONS_PER_MINUTE=10 ./set-thresholds.sh
   ```
4. Run a role pack:
   ```bash
   ./run-heartbeat.sh manager
   ./run-heartbeat.sh auditor
   ./run-heartbeat.sh trader_quant
   ```
5. Send output using the template printed by `run-heartbeat.sh`.

## Operating Rules

- Run each role pack on its heartbeat cadence in `agents/*/HEARTBEAT.md`.
- If a check breaches a hard stop, write to `alerts_log` immediately and escalate.
- Keep report language short, numeric, and decision-oriented.
