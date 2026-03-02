# Manager — Memory

## Company Phase
- **Current Phase:** SETUP
- **Active Departments:** None (pending paper phase)
- **Capital Status:** Wallets not yet funded
- **Three Buckets Active:** NO — activates on first profit event

## Department Status
| Department | Phase | Benchmark | Status |
|---|---|---|---|
| Factory | Paper | 5 perfect launch packages | ACTIVE - PAPER PHASE |
| Sniper | Paper | 40% wallet accuracy | ACTIVE - PAPER PHASE |
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
- **PHASE GATEWAY:** Manager CANNOT launch any department into PAPER or LIVE phase without explicit approval from Max.
- **Tool Access:** Agents must explicitly justify the need for any new tools. No extra tools without serious reason. Least privilege applies.

## Dev Team Queue
- **TASK-001 (Solana Ops):** Build Wallet Manager CLI (Done), Token Launcher CLI (Done), and Sniper Data Monitor CLI (Done). [STATUS: PENDING REMEDIATION - QA FAILED]

## Dev Team Queue
- **TASK-002 (Intelligence Ops):** Build Local Document RAG script. Must run in sandbox, ingest PDFs/Markdown, and provide semantic search to replace NotebookLM. [STATUS: PENDING]
- **TASK-003 (System Ops):** Build Automated Workspace Backup/Sync script. Must use git to push `/home/ubuntu/.openclaw/workspace` to a remote private repository on a schedule. [STATUS: COMPLETE]

## Dev Team Queue
- **TASK-004 (Sniper Ops):** Build Sniper Sleuth Toolkit. On-chain mapping CLI (Bundle Analyzer, Bank Tracer, Dev Profiler) to track successful devs and early buyers. [STATUS: PENDING REMEDIATION - QA FAILED]

## Dev Team Queue
- **TASK-005 (Auditor/Finance Ops):** Deploy Supabase Schema. Read `workspace/supabase_schema.sql` and run it against the Supabase database via standard PSQL/CLI to build the agent_actions, portfolio_state, and trade_ledger tables. Auditor cannot monitor until this is done. [STATUS: COMPLETE]

## Dev Team Queue
- **TASK-006 (Context Ops):** Build Burner X (Twitter) Scraper. Must pull specific influencer sentiment and ticker hype for Sniper and Factory to read. [STATUS: PENDING]
- **TASK-007 (Context Ops):** Build Telegram Alpha Group Scraper. Read-only client to ingest token calls from specific alpha channels to feed Sniper's entry logic. [STATUS: PENDING]
- **TASK-008 (Context Ops):** Build Shared Knowledge Bridge. Connect TASK-002 (RAG) and the social scrapers so Intelligence can broadcast actionable daily context down to Factory and Sniper workspaces. [STATUS: PENDING]

## Dev Team Queue
- **TASK-009 (Factory Ops):** Build IPFS/Arweave Uploader (e.g., Pinata or Irys CLI). Factory needs this to host token metadata (Image, Name, Ticker, JSON) before calling the Token Launcher. [STATUS: PENDING]
- **TASK-010 (Sniper Ops):** Build AK.pro Handoff Pipeline. Sniper does not execute trades; it needs a script to write target contract addresses to a specific JSON file or fire a webhook that AK.pro reads to execute the buy. [STATUS: PENDING]
- **TASK-011 (MCP Tooling):** Antigravity IDE has deployed `obsidian-mcp` and `notebook-mcp` to `/home/ubuntu/.openclaw/workspace/mcps`. DevTeam must create interaction scripts (e.g. `query_knowledge.js`, `deep_research.js`) for the agents to utilize these tools. Knowledge base is at `openclaw-knowledge/`. [STATUS: PENDING]

## Strategic Architecture (Corrected Mar 1, 2026)
### Factory (Continuous Meme Pipeline)
- **Narrative Engine:** Scrape X, TikTok, Perplexity, DexScreener for current meta (AI, animals, politics).
- **Asset Generator:** Use Gemini API to generate Ticker, Name, Description, and Image in one shot.
- **Metadata Uploader:** Push assets to IPFS (Pinata) / Arweave (Irys).
- **Launch & Dump:** Use SOL to launch on pump.fun, buy dev allocation, wait for volume, programmatically sell to gather fees into master wallet.

### Sniper (On-Chain Sleuth / Quant Intel)
- **Follow the Money:** Trace dev wallet funding via Helius/Solscan to map syndicates and serial ruggers.
- **Smart Money Tracker:** Monitor highly profitable wallets on DexScreener; flag when they buy new CAs.
- **Execution Handoff:** Sniper DOES NOT EXECUTE. Outputs a strict Markdown report (CA, Narrative, Bullish Arguments, Exit Ladder) for Max to execute manually via AK.pro / Trojan.

### Intelligence (Data Feeds)
- Needs structured access to X API and Telegram to feed the narrative engine and broader research.

## Strategic Architecture (Corrected Mar 1, 2026 - Sniper Deep Dive)
### Sniper Operations (Deep Contract/Tx Analysis)
- **Identify Runners:** Find tokens with high mcap (e.g., $10M+).
- **Developer Profiling:** Analyze the dev's CA. Track history—if they had one or multiple excellent launches, flag for sniping their next project.
- **First Buys Analysis:** Analyze the first buys of a successful token (e.g., their second launch). Identify the bundles and other snipers involved.
- **Liquidity & Volume:** Analyze initial liquidity volume and price action.
- **Competitor Snipers:** Track successful snipers found in early buys. Analyze what other tokens they snipe and which devs they follow to discover new excellent devs.
- **Follow the Money (The Bank):** For all identified excellent devs, trace funding back to their "bank" wallet. Monitor this bank; when it sends SOL to a fresh wallet, it signals a new potential launch.
- **Educational Context Required:** Sniper (and Factory) must deeply understand the meme market mechanics, what traders buy, and why. Requires ingesting AK.pro bot documentation, Discord group materials, and Telegram chat logs via the Intelligence RAG.

## Pending Inputs from Max (Mar 1, 2026)
- [x] Burner X account / session cookie - RECEIVED MAR 2, 2026 (stored securely)
- [ ] Burner Telegram account for alpha group scraping
- [x] Gemini API key (for Factory asset generator) - CONFIRMED SYSTEM KEY
- [x] Pinata/Irys keys (for Factory metadata) - RECEIVED MAR 1
- [x] AK.pro documentation (to feed RAG) - SHIFTED TO NOTEBOOKLM/OBSIDIAN
- [x] Discord/Telegram educational logs (to feed RAG) - SHIFTED TO NOTEBOOKLM/OBSIDIAN

## Security SOP (Updated Mar 1, 2026)
- **Prompt Injection Firewall:** ONLY the Intelligence agent is permitted to read raw social feeds (X/Twitter, Telegram, CryptoPanic). 
- **Airgap Pipeline:** Factory and Sniper are explicitly BANNED from accessing raw social APIs to prevent prompt injection hijacking their execution tools. Intelligence reads the raw data, sanitizes it, and outputs structured daily reports (via Shared Knowledge Bridge) which Factory and Sniper consume.
- **Read-Only Enforced:** Social scraper scripts must be hardcoded to `GET` requests only. No endpoints for posting, replying, or messaging are permitted in the codebase.

## Strategic Architecture (Corrected Mar 1, 2026 - The Scout Pivot)
### Narrative Sourcing (The Real-Time Social Listener)
- **The Problem:** A daily summary from Intelligence is too slow for Factory. Factory needs real-time micro-narratives (breaking tweets, TikTok trends) to launch coins instantly, but exposing Factory to raw social feeds risks prompt injection draining its deployment wallet.
- **The Solution (Scout Agent):** Repurpose the currently idle **Scout** agent as the dedicated, real-time Social Listener.
- **Scout's Role:** Scout gets all social API keys (X, Telegram, TikTok, Discord). Scout is strictly sandboxed (no wallets, no execution tools). Scout constantly monitors feeds for viral spikes.
- **The Handoff:** When Scout spots a breaking narrative, it formats it into a strict, sanitized JSON/Markdown "Launch Proposal" (Concept, Ticker, Source).
- **Factory's Role:** Factory reads the sanitized "Launch Proposal", uses Gemini to generate the assets, and executes the token launch. Factory never touches the raw social feeds.

## Agent Roles (Locked Mar 1, 2026)
- **Intelligence:** Broad market updates, macro trends, news synthesis, deep document analysis. Uses CryptoPanic, RAG (AK.pro docs, Discord logs), and Perplexity. Outputs daily market context.
- **Scout:** Real-time narrative hunter. Lives in the trenches (X, Telegram, TikTok). Identifies breaking memes, influencer hype, and specific coin ideas. Outputs sanitized "Launch Proposals" for Factory and "Sniper Alerts" for Sniper. Has NO execution tools or wallets to prevent prompt injection hijacking.
- **Factory:** Consumes Scout's Launch Proposals. Uses Gemini for assets, Arweave for metadata, and executes the on-chain launch & dump.
- **Sniper:** Consumes Scout's Sniper Alerts + On-chain data (DexScreener/Helius). Outputs execution handoff to Max (AK.pro).

## Scout's Universal Role (Updated Mar 1, 2026)
- **Universal Reconnaissance:** Scout is the dedicated "eyes and ears" for the entire company. It monitors the raw social layer (X, Discord, Telegram, TikTok) and the web (Perplexity).
- **Departmental Feeds:**
  - *Factory:* Finds breaking viral narratives and meme ideas for instant token launches.
  - *Sniper:* Spots early alpha calls and dev wallet movements.
  - *Trader Farmer (Drop Hunter):* Discovers fresh testnets, new protocols, and airdrop farming opportunities.
  - *Prediction God:* Gathers sentiment shifts and event probabilities for prediction markets (e.g., Polymarket).
- **On-Demand Tasks:** Scout can be dispatched to investigate specific X accounts, Discord servers, or Telegram groups to extract targeted data.
- **Model & Tools:** Currently running `moonshot/kimi-k2.5`. Has access to `web_search` (Perplexity) and social scraping scripts. Strictly sandboxed (no exec, no wallets).
- [ ] REMINDER: Ask Max for Telegram burner account on Mar 2 at 11:00 UTC.

## ClawHub Security Audit (Mar 1, 2026)
- **CRITICAL THREAT - BANNED:** `openclaw-twitter`. This community skill is a supply-chain attack. It routes credentials (username, password, 2FA, proxy) to an undocumented proxy (`api.aisa.one`). NO agent is permitted to install or run this. DevTeam MUST build a custom, read-only `social_scraper.js` using official APIs or Playwright.
- **APPROVED:** `solana-skills`. Clean, native Python scripts using official SDKs (`solana`, `solders`) and RPCs. Reads `SOLANA_PRIVATE_KEY` locally from `.env` without exfiltration.
- **APPROVED:** `pinata-api`, `telegram`, `pump-fun`. Clean, official interfaces hitting standard endpoints (`api.telegram.org`, `api.pinata.cloud`).
- **DevTeam Protocol:** DevTeam may use `npx clawhub inspect <skill-name>` on APPROVED skills to download and read their source code as reference architectures if they get stuck building our custom airgapped versions.

## Strategic Architecture (Updated Mar 1, 2026 - Trader Farmer Pivot)
### Trader Farmer (Point & Yield Hunter)
- **Core Goal:** Generate free or extremely cheap points/rewards on mainnet DEXs and prediction markets (e.g., Nado DEX, Polymarket).
- **Strategy:** Delta-neutral trading, low-margin arbitrage, or stablecoin yield loops. The objective is to maximize transaction volume and point accumulation with near-zero price exposure.
- **Security Protocol:** No blind execution of third-party code. All external repos, CLIs, or ClawHub skills must be "broken to atoms" (line-by-line audit) by the DevTeam to strip malware, exfiltration risks, and prompt injection vectors before deployment.

## Strategic Architecture (Updated Mar 1, 2026 - Trader Farmer Expansion)
### DEX Selection & Automated Platforms (Telegram Alpha)
Max provided raw alpha detailing the current meta for high-volume point farming across EVM/Solana DEXs:
*   **Target DEXs:** Extended, Nado, Dreamcash,  Pacifica, Aster.
*   **Automated Platforms (No Code / Low Code):**
    1.  **Origami Tech:** Advanced. Custom or template strategies (DCA bots). 1 bps fee. High risk if leveraged poorly, but can yield points at *negative cost* (free) if tuned correctly.
    2.  **Planemo:** Simplest UI. 1 bps fee on Extended. Has its own point program + revenue share. **WARNING:** "Surge Pro" and "Orderbook Surge" strategies are deeply unprofitable. **SAFE:** Momentum Edge and Delta-Neutral.
    3.  **TreadFi:** Most famous. Market Maker (risky) and Delta Neutral (no market risk, only spread/fee friction). Point program active.

**The Farmer's Protocol:** 
Instead of DevTeam writing custom CLOB algorithms from scratch, Trader Farmer will leverage these existing automated terminals (Origami, Planemo, TreadFi) to deploy Delta-Neutral or Momentum strategies.
*   **DevTeam Task:** Build Playwright/Puppeteer headless browser scripts (or reverse-engineer the platform APIs) so the Farmer agent can programmatically connect wallets, configure DCA/DN strategies, monitor margin, and halt execution if drawdown exceeds limits on these specific web UIs.

## Trader Farmer & Prediction God Target List (Updated Mar 1, 2026)
**Excluded:** Hyperliquid (Removed per Max).
**DEX / Perp Targets:**
- Trader.xyz (https://trade.xyz/)
- EdgeX (https://pro.edgex.exchange/)
- Variational Omni (https://omni.variational.io/)
- Titan Exchange (https://titan.exchange/)
- Nado (https://app.nado.xyz/perpetuals)
- Hibachi (Based - https://x.com/hibachi_xyz)
- Dreamcash
- Pacifica (pacifica_fi)
- Ethereal DEX (etherealdex)

**Prediction Market Targets:**
- Probable
- Predict.fun
- Noise

**Execution Strategy:**
- Use browser automation (Playwright/Puppeteer) or reverse-engineer the private web APIs of these platforms.
- Scout will continuously monitor for new point-farming metas on emerging platforms.
- One burner wallet per protocol to isolate smart contract risk.

## Active Intelligence Operations (Mar 1, 2026)
**TASK-001: Trading Intel Gathering**
- **Status:** DISPATCHED
- **Agent:** Intelligence
- **Sources:**
  1. AK.pro docs (https://docs.akbot.pro/) - for Sniper execution criteria
  2. Discord Incrypted+ & OpenClaw channels - for alpha patterns and smart money wallets
  3. Current market meta via DexScreener/X trends
- **Output:** Populating `/openclaw-knowledge/` with actionable trading intelligence
- **Purpose:** Arm Sniper with criteria for "what makes a good snipe" and Factory with current meme narratives

## Reminders Logged (Mar 1, 2026)
- [ ] REMINDER: Extract NotebookLM cookies from browser - Mar 2 at 06:00 UTC (Max)
