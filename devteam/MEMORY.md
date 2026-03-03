# Dev Team — Memory

## Tool Library
| Tool | Purpose | Department | Status | Deployed |
|---|---|---|---|---|
| workspace-sync | Automated workspace backup to GitHub | DevTeam | Deployed | Yes |
| wallet-manager | Secure Solana wallet generation & balance checking | DevTeam | Deployed | Yes |
| token-launcher | SPL token creation, minting, and info | DevTeam | Deployed | Yes |
| sniper-monitor | Token data from DexScreener (trending, search, top) | Sniper | Deployed | Yes |
| local-rag | Semantic search for Markdown/PDF with embeddings | Intelligence | Deployed | Yes |
| sleuth | On-chain tracing tools (bundle-analyzer, bank-tracer, dev-profiler) | Sniper | Deployed | Yes |
| deploy-supabase | Database schema deploy script | All | Deployed | Yes |
| telegram-notifier | Sends notifications to Manager/Auditor/Finance Telegram channels | DevTeam | Deployed | Yes |
| telegram-setup | Telegram bot configuration and testing utility | DevTeam | Deployed | Yes |
| wallet-aging | Simulated Solana wallet aging (random swaps for organic activity) | DevTeam | Deployed | Yes |

## Deployed
- Supabase schema (7 tables): `trade_ledger`, `agent_actions`, `portfolio_state`, `wallet_registry`, `paper_trades`, `company_wiki`, `department_status`
- All 5 departments pre-populated in `department_status` with `'setup'` phase
- Git synced to `https://github.com/RunHobbitRun/openclaw-orchard.git` (commit `705437d3`)

## New Deployments (2026-03-03)
- **Telegram bot scripts** (`built_tools/scripts/`)
  - `telegram-notifier.mjs` - Send messages to Manager/Auditor/Finance channels
  - `telegram-setup.mjs` - Bot setup, info, polling mode
- **Wallet aging script** (`built_tools/scripts/wallet-aging.mjs`)
  - Simulates organic wallet activity on Solana testnet
  - Logs to Supabase `agent_actions` table
- **Dependencies added**: `telegraf`, `@solana/web3.js`

## Current Queue
| Priority | Task | Requested By | Status |
|---|---|---|---|
| LOW | Telegram bot production deployment | System | Ready for Max approval |
| LOW | Wallet aging script production deployment | Security | Ready for Max approval |

## Staging Environment
- Antigravity IDE workspace: configured
- Available CLIs: gemini, opencode, kilocode, codex, pi

## Staging Test Results
- `telegram-notifier.mjs`: Syntax OK,_sends to configured channels_
- `telegram-setup.mjs`: Syntax OK, _polling mode working_
- `wallet-aging.mjs`: Syntax OK, _requires SOLANA_PRIVATE_KEY env var_
- Dependencies installed: telegraf@4.16.3, @solana/web3.js@1.95.4
