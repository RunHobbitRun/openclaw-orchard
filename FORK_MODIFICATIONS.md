# FORK_MODIFICATIONS.md

# Every file modified from the original OpenClaw codebase is listed here.

# Purpose: upstream merge conflict reference. Check this file before merging any upstream update.

## Modifications

### src/gateway/net.ts [UPSTREAM-SUPERSEDED]

Purpose: Gateway IP trust + loopback enforcement — strict loopback bind resolution and safer X-Forwarded-For handling
Status: Upstream's v2026.2.26 merged improvements that supersede our patches (stricter parseIpLiteral validation, allowRealIpFallback guard)

### src/infra/tailnet.ts [MODIFIED]

Purpose: Tailnet address discovery hardening — treat interface enumeration failures as empty
Risk if removed: security audit and gateway probe flows can crash in restricted environments

### src/telegram/bot.create-telegram-bot.test.ts [MODIFIED]

Purpose: Test harness DNS stubbing — avoid live DNS/SSRF lookups in Telegram media tests
Risk if removed: tests can fail in network-restricted environments

### src/slack/monitor/media.test.ts [MODIFIED]

Purpose: Test harness DNS stubbing — avoid live DNS/SSRF lookups in Slack media tests
Risk if removed: tests can fail in network-restricted environments

### extensions/msteams/src/messenger.test.ts [MODIFIED]

Purpose: Test uses OpenClaw temp root for local media allowlist compliance
Risk if removed: tests fail under hardened local media path policy

### src/browser/extension-relay.test.ts [MODIFIED]

Purpose: Skip relay tests when loopback binding is not permitted by the environment
Risk if removed: tests fail in restricted environments that forbid 127.0.0.1 binding

## Additions (Orchard v1 Agent System)

### agents/ [NEW DIRECTORY]

12-agent Orchard workspace system with prompt files:
- manager, auditor, finance, intelligence, security, scout
- devteam, factory, sniper, trader_farmer, trader_quant, prediction_god
Each contains: AGENTS.md, SOUL.md, IDENTITY.md, MEMORY.md, HEARTBEAT.md

### agents/supabase_schema.sql [NEW]

Supabase database schema for Orchard agent data persistence

### agents/emergency_sweep.sh [NEW]

Emergency wallet sweep script for system lockdown scenarios

### deploy/ [NEW DIRECTORY]

Server deployment templates:
- .env.template — environment variables for all API keys and bot tokens
- openclaw.json.template — multi-agent routing config in official OpenClaw format

### scripts/orchard-watchdog.sh [NEW]

Process monitoring watchdog with Telegram alerting and auto-restart

### scripts/orchard-watchdog.service [NEW]

Systemd service file for the Orchard watchdog
