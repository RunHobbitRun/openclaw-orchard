# Agent Role and Instrument Map

This document translates each agent role into concrete inputs, outputs, and instruments.

## System Layers

1. Command and risk control: `manager`, `auditor`, `finance`, `security`
2. Market sensing: `intelligence`, `scout`
3. Execution and alpha production: `factory`, `sniper`, `trader_farmer`, `trader_quant`, `prediction_god`
4. Delivery infrastructure: `devteam`

## Role Contracts

| Agent | Primary Objective | Required Data | Required Output | SQL Pack | Template |
|---|---|---|---|---|---|
| manager | Coordinate all departments and escalate | `department_status`, `capital_requests`, `alerts_log`, `market_briefs`, `dev_tasks` | Daily/weekly brief + decisions | `instruments/sql/manager.sql` | `instruments/templates/manager-daily-brief.md` |
| auditor | Detect loops, unauthorized actions, hard-stop breaches | `agent_actions`, `trade_ledger`, `portfolio_state`, `alerts_log`, `system_thresholds` | Immediate critical alerts | `instruments/sql/auditor.sql` | `instruments/templates/auditor-critical-alert.md` |
| finance | Capital control and reporting | `portfolio_state`, `capital_requests`, `department_status`, `trade_ledger` | Daily capital report + request resolution | `instruments/sql/finance.sql` | `instruments/templates/finance-daily-report.md` |
| security | Wallet lifecycle and anomaly detection | `wallet_registry`, `trade_ledger`, `alerts_log` | Wallet assignment/incident alerts | `instruments/sql/security.sql` | `instruments/templates/security-incident.md` |
| intelligence | Produce sanitized market briefs | `market_briefs`, `agent_actions` | Standard/urgent intelligence brief | `instruments/sql/intelligence.sql` | `instruments/templates/intelligence-standard-brief.md` |
| scout | Source high R/R opportunities | `company_wiki`, `department_status` | Proposal with quantified edge | `instruments/sql/scout.sql` | `instruments/templates/scout-proposal.md` |
| factory | Build token launch packages | `trade_ledger`, `wallet_registry` | Narrative package with timing and wallet | `instruments/sql/factory.sql` | `instruments/templates/factory-package.md` |
| sniper | Maintain and rank wallet watchlist | `wallet_profiles`, `paper_trades` | Weekly top wallet report | `instruments/sql/sniper.sql` | `instruments/templates/sniper-watchlist.md` |
| trader_farmer | Optimize farming strategies by cost/point | `trade_ledger`, `paper_trades` | Farming performance and pause signals | `instruments/sql/trader_farmer.sql` | `instruments/templates/trader-farmer-report.md` |
| trader_quant | Research and validate strategies | `strategy_candidates`, `trade_ledger` | Backtest/paper outcomes + capital request trigger | `instruments/sql/trader_quant.sql` | `instruments/templates/trader-quant-report.md` |
| prediction_god | Find prediction-market edges | `paper_trades`, `trade_ledger` | Probability-based recommendation | `instruments/sql/prediction_god.sql` | `instruments/templates/prediction-recommendation.md` |
| devteam | Deliver and maintain internal tools | `dev_tasks` | Delivery note + runbook | `instruments/sql/devteam.sql` | `instruments/templates/devteam-delivery-note.md` |

## Gaps Closed by This Instrument Set

- Added missing tables used by agent instructions: `wallet_profiles`, `strategy_candidates`, `capital_requests`, `market_briefs`, `alerts_log`, `dev_tasks`, `system_thresholds`.
- Added role-specific SQL packs aligned with heartbeat cadence.
- Added standardized templates so each report is structured and reviewable.

## Required Operating Discipline

1. Every heartbeat run should execute the role SQL pack first.
2. Every external message should use the matching template.
3. Every hard-stop should create an `alerts_log` record before escalation.
4. Every capital movement should have `risk_approval_id` or explicit denial log.
