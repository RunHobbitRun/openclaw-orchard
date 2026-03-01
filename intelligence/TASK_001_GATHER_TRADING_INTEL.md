# TASK-001: Gather Trading Intelligence for Sniper

## Priority Sources (Per Max)

### 1. AK.pro Documentation
**Source:** https://docs.akbot.pro/
**Tool:** Use `deep_research.js` via NotebookLM MCP
**Output:** Create comprehensive notes in `/openclaw-knowledge/Trading-Tools/AKpro/` covering:
- Bot setup and configuration
- Entry/exit strategies (Sniper mode, Degen mode)
- Wallet management and security
- Token scanning criteria (what makes a "good" snipe)
- Risk management settings

### 2. Discord Alpha Channels
**Sources:** 
- Incrypted+ channel (alpha calls, wallet tracking)
- OpenClaw channel (internal coordination)
**Tool:** Read Discord export/messages, analyze patterns
**Output:** Create `/openclaw-knowledge/Alpha-Intel/Discord-Signals/` with:
- Common signal formats used by top callers
- Wallet addresses frequently mentioned as "smart money"
- Timing patterns (when do good calls happen?)
- Narratives/themes that lead to successful pumps

### 3. Current Market Meta
**Source:** DexScreener trending, X/Twitter narratives
**Tool:** Scout social feeds + web_search
**Output:** `/openclaw-knowledge/Market-Meta/Current-Trends/`

## Success Criteria
- Sniper can query "What makes a good snipe?" and get AK.pro criteria
- Sniper can query "Which wallets should I track?" and get Discord alpha wallet list
- Factory can query "What's the current meme narrative?" and get trending themes

## Handoff Protocol
Once complete, save all findings to Obsidian vault and notify Manager for Sniper/Factory deployment.
