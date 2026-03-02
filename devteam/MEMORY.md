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

## Current Queue
| Priority | Task | Requested By | Status |
|---|---|---|---|
| HIGH | Telegram bot configuration | System | Pending |
| HIGH | Wallet aging script (Solana) | Security | Pending |

## Staging Environment
- Antigravity IDE workspace: configured
- Available CLIs: gemini, opencode, kilocode, codex, pi

## Deployed
- Supabase schema (7 tables): trade_ledger, agent_actions, portfolio_state, wallet_registry, paper_trades, company_wiki, department_status
- All 5 departments pre-populated in department_status with 'setup' phase
