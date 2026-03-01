# DEV TEAM TASK DISPATCH - MAR 1

Attention DevTeam. You are strictly sandboxed. Max is withholding all external API keys (Gemini, X, Telegram, Pinata) and RAG documents until the core mechanical infrastructure is proven to work.

You are to execute the following **keyless** tasks immediately:

## 1. QA & Testing (High Priority)
You must write automated test scripts for your previously delivered tools to prove they actually function against public/live endpoints.
*   **TASK-001 (Solana Ops):** Write a script that uses the Wallet Manager CLI to generate a fresh testnet wallet and request an airdrop, or uses the Sniper Monitor to pull real-time data from DexScreener's public API for a known token (e.g., $WIF or $BONK). Provide the raw execution log.
*   **TASK-004 (Sniper Sleuth):** Write a script that takes a known dev wallet and traces its first 5 transactions using Helius (use a public RPC if you don't have a key). Provide the raw execution log.

## 2. Infrastructure Build (Pending Inputs)
You must build the engines for the following tools, using dummy data for now.
*   **TASK-002 (Local RAG Engine):** Build the SQLite vector database and the Python ingestion script. Do not wait for Max's PDFs. Create a dummy markdown file (e.g., "dummy_alpha.md"), ingest it, and write a search script that successfully queries it.
*   **TASK-010 (AK.pro Handoff):** Build the execution handoff script. Write a Python script that takes a dictionary containing a Contract Address, Narrative, Bullish Arguments, and Exit Ladder, and formats it cleanly into both a local `target.json` file and a formatted Markdown report.

**DO NOT ATTEMPT TO BUILD TASK-006, 007, OR 009.** You do not have the keys.

Deliver execution logs for the QA tasks and the source code for the infrastructure tasks.

## 3. Social Sentiment Feed (New Input)
Max has provided the CryptoPanic API key.
*   **TASK-006 (CryptoPanic Scraper):** Build a Python CLI script that uses the CryptoPanic API (read key from `/home/ubuntu/.openclaw/workspace/.cryptopanic_key`) to pull the latest trending news, specific ticker sentiment, and market narratives. Format the output cleanly for the Intelligence agent to consume.

## 4. X (Twitter) Narrative Scraper (New Input)
Max has provided an X authorization token.
*   **TASK-006 (X Narrative Engine):** Build a Python script that uses this X token (`/home/ubuntu/.openclaw/workspace/.x_token`) to monitor trending hashtags, specific crypto influencers, and broad market meta. This will feed directly into the Intelligence RAG and Factory Narrative Engine.

## 5. Discord Recon Scraper (New Input)
Max has provided a Discord user token.
*   **TASK-011 (Discord Scraper for Scout):** Build a Python script that uses this Discord token (`/home/ubuntu/.openclaw/workspace/.discord_token`) to read specific channels/servers. 
*   **CRITICAL SECURITY RULE:** This script MUST BE READ-ONLY. Do not implement any functionality to post messages, reply, DM, or interact with bots/users. Scout is strictly forbidden from chatting.

## 6. MCP Knowledge Infrastructure (CRITICAL UPGRADE)
Max has just deployed the NotebookLM and Obsidian MCP servers. This fully replaces our old plan for TASK-002 (Local RAG) and TASK-008 (Shared Knowledge Bridge).

*   **ABANDON TASK-002 and TASK-008:** Stop work on the SQLite local RAG immediately.
*   **EXECUTE TASK-011 (MCP Tooling):** You must immediately review and execute `SPEC-006-MCP-Tools.md` in your workspace. Build the Node.js wrappers (`deep_research.js` and `query_knowledge.js`) so that our executing agents can talk to these MCP servers via standard system run commands. The servers are at `/home/ubuntu/.openclaw/workspace/mcps/` and the vault is at `/home/ubuntu/.openclaw/workspace/openclaw-knowledge/`.
