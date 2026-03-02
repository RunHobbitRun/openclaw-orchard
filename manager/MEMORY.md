# Manager — Memory (Trimmed)

_Last updated: 2026-03-02 UTC._

## Company Phase
- Global state: SETUP
- Paper phase active: Factory, Sniper
- Live execution: DISABLED until explicit Max approval

## Contact & Routing
- Max Telegram route: `telegram:8138061424` (configured)
- Scheduled briefs should use active delivery context first, then fallback route.
- Contact blocker status: CLEAR

## Department Status
| Department | Current State | Gate to Progress |
|---|---|---|
| Factory | PAPER ACTIVE | 5 high-quality paper launch packages |
| Sniper | PAPER ACTIVE | >=40% watchlist/paper accuracy |
| Trader Farmer | SETUP | Positive 2-week simulation |
| Trader Quant | SETUP | Core strategy + validation baseline |
| Prediction God | SETUP | Acceptable calibration score |

## Non-Negotiable Operating Rules
- Manager does orchestration and decisions, not raw coding. All code/tool work routes through DevTeam.
- No department can move to new phase (SETUP -> PAPER -> LIVE) without explicit Max approval.
- Least-privilege tool policy by default. Any new tool access must be justified and approved.
- Execution agents must not consume unsanitized raw social feeds directly.

## Active Dev Queue (Actionable)
- TASK-002: Local RAG script for document ingestion/search — PENDING
- TASK-007: Telegram alpha group scraper — PENDING
- TASK-008: Shared knowledge bridge (RAG + social feeds) — PENDING
- TASK-009: IPFS/Arweave metadata uploader for Factory — IN PROGRESS
- TASK-010: AK.pro handoff pipeline for Sniper outputs — IN PROGRESS
- TASK-011: MCP interaction scripts for notebook/obsidian workflows — IN PROGRESS

## Completed Foundation Work
- TASK-001 Solana ops tooling — COMPLETE
- TASK-003 workspace backup/sync automation — COMPLETE
- TASK-004 sniper sleuth toolkit — COMPLETE (minor retry hardening follow-up)
- TASK-005 Supabase schema deployment — COMPLETE
- TASK-006 Burner X sentiment scraper — BUILT
- TASK-012 Auditor Supabase query CLI — COMPLETE

## Dev Queue Snapshot (for status reports)
- Done: 6
- In progress: 3
- Pending: 3

## Pending Inputs From Max
- Burner Telegram account/session for alpha scraping: REQUIRED (TASK-007)
- **Factory/Sniper/DevTeam activation:** Max needs to start these agent sessions (Manager lacks spawn permission)

## Activation Status (2026-03-02 19:10 UTC)
| Agent | Status | Mode | Dependency |
|---|---|---|---|
| Factory | ACTIVATION.md ready | Continuous loop | None |
| Sniper | ACTIVATION.md ready | Continuous loop | None |
| DevTeam | ACTIVATION.md ready | Task-based | None |
| Scout | ACTIVATION.md ready | Continuous | Intelligence CT sources |
| Intelligence | ACTIVATION.md ready | Continuous | Max's CT accounts |
| Trader Farmer | SETUP | — | Not created |
| Trader Quant | SETUP | — | Not created |
| Prediction God | SETUP | — | Not created |

## Operational Reminders
- If dev wallet falls below 0.1 SOL, pause launch workflow and alert Max.
- Keep MEMORY.md as durable truth only; avoid long narrative history.
- Escalate high-risk changes before acting.
