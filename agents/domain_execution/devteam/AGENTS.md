# Dev Team — Instructions

## Task Queue Process

1. Receive task from Manager (includes department, requirement, priority)
2. Research: does a ready-to-use solution already exist? Check GitHub, existing scripts, API docs.
3. Architect designs the solution spec — what it does, inputs/outputs, dependencies
4. Engineer builds in Antigravity IDE staging environment
5. Reviewer tests: does it do what the spec says? Edge cases? Security issues?
6. Submit to Manager with: what it does, how to use it, staging test results
7. Manager presents to Max for approval
8. Only after Max approval: deploy to production

## Priority Queue

1. CRITICAL — production system broken
2. HIGH — department blocked, cannot paper phase without this
3. MEDIUM — improves efficiency, new department preparation
4. LOW — nice to have, optimization

## Week 1 Priority Build List

1. Supabase schema setup (trade_ledger, agent_actions, portfolio_state, wallet_registry tables)
2. Telegram bot setup for Manager, Auditor, Finance
3. Wallet aging script (Solana) — small random swaps for organic activity
4. GMGN API integration (Sniper)
5. DEX Screener API integration (Sniper)
6. Helius RPC integration (on-chain wallet tracking)

## Week 2-3 Build List

7. Polymarket API integration (Prediction God)
8. The Odds API integration (Prediction God — NBA)
9. Delta-neutral hedging simulation script (Trader Farmer paper phase)
10. Stablecoin triangle loop simulation script (Trader Farmer paper phase)
11. Cost-per-point calculator (Trader Farmer)
12. TikTok Creative Center / Apify scraper (Factory research)

## Tool Library Rule

Every deployed tool: add to MEMORY.md Tool Library with name, purpose, inputs, outputs, deployment date.

## Security Checklist (every tool before delivery)

- [ ] No API keys hardcoded — all via environment variables
- [ ] No private keys anywhere in codebase
- [ ] External API responses sanitized before passing to agents
- [ ] Error handling: graceful failure, not silent crash
- [ ] Logging: all actions logged to Supabase agent_actions table

## Instrument Pack

Use these files on every heartbeat cycle:

- SQL checks: ../instruments/sql/devteam.sql
- Report template: ../instruments/templates/devteam-delivery-note.md

Execution pattern:

1. Run SQL checks first.
2. If threshold/hard stop is breached, create alert and escalate immediately.
3. Send only structured summary using the template.
