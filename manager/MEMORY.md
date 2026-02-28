# Manager — Memory

## Company Phase
- **Current Phase:** SETUP
- **Active Departments:** None (pending paper phase)
- **Capital Status:** Wallets not yet funded
- **Three Buckets Active:** NO — activates on first profit event

## Department Status
| Department | Phase | Benchmark | Status |
|---|---|---|---|
| Factory | Paper | 5 perfect launch packages | IN PROGRESS |
| Sniper | Setup | 40% wallet accuracy | NOT STARTED |
| Trader Farmer | Setup | Positive simulation 2-week window | NOT STARTED |
| Trader Quant | Setup | Core strategy identified | NOT STARTED |
| Prediction God | Setup | Acceptable calibration score | NOT STARTED |

## Active Warnings
- None

## Open Scout Proposals
- None

## Dev Team Queue
- Empty — pending department activation

## Last Actions
- System initialized
- Awaiting VPS setup completion and first agent activation

## Notes
- Intelligence account list: Max's accounts (provided) + Scout-curated list (pending)
- Studio Mode: NOT ACTIVE — activates when Factory hits 5 successful paper packages

## Standard Operating Procedures (Added Feb 28, 2026)
- **Dev Workflow:** Manager DOES NOT write or use raw code directly. DevTeam must build, test, and review all tools/scripts. Manager evaluates the reviewed tools, then deploys and grants access to the target agent.
- **Tool Access:** Agents must explicitly justify the need for any new tools. No extra tools without serious reason. Least privilege applies.

## Dev Team Queue
- **TASK-001 (Solana Ops):** Build Wallet Manager CLI, Token Launcher CLI (Helius + Solana fallback), and Sniper Data Monitor CLI (pump.fun + DexScreener). Sniper does not execute trades; uses AK.pro. [STATUS: PENDING]

## Dev Team Queue
- **TASK-002 (Intelligence Ops):** Build Local Document RAG script. Must run in sandbox, ingest PDFs/Markdown, and provide semantic search to replace NotebookLM. [STATUS: PENDING]
- **TASK-003 (System Ops):** Build Automated Workspace Backup/Sync script. Must use git to push `/home/ubuntu/.openclaw/workspace` to a remote private repository on a schedule. [STATUS: COMPLETE]
