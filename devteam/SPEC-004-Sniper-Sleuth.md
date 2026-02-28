# Dev Team Specification: Sniper Sleuth Toolkit (TASK-004)

## Overview
Sniper is a quantitative research agent, not an execution bot. To find alpha, Sniper needs deep on-chain mapping tools to track successful developers, map their funding networks ("Banks"), and analyze block-0 buyers (other snipers).

## Requirements
Use the Helius RPC (`HELIUS_API_KEY`) to build a Node.js CLI tool (`sleuth.js`) with the following commands:

### 1. bundle-analyzer
- **Input:** Token Contract Address (Mint)
- **Action:** Pull the earliest transactions (block 0 to block 5) for this token.
- **Output:** A JSON list of the very first buyer wallets, sorted by timestamp/slot. (These are the other "snipers" we want to track).

### 2. bank-tracer
- **Input:** A Developer's Wallet Address
- **Action:** Trace the SOL funding history backwards. Where did the wallet get its initial SOL to deploy the contract? 
- **Output:** Identify the parent funding wallet (The "Bank"). 

### 3. dev-profiler
- **Input:** Developer's Wallet Address
- **Action:** Query all SPL tokens created by this wallet.
- **Output:** List of historical tokens deployed by this dev.

## Constraints
- Rely exclusively on `@solana/web3.js` and Helius RPC.
- Must handle rate limits gracefully.
- Output clean JSON so the Sniper agent can easily parse the data.
