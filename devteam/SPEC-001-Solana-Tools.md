# Dev Team Specification: Solana Operational Tools (TASK-001)

## Overview
As per Manager and Max, the Dev Team must build, test, and review the following operational tools before they are deployed to the operational departments (Factory, Sniper). 

## Tools Required

### 1. Wallet Manager CLI
**Purpose:** Securely generate new Solana wallets and check balances.
**Requirements:**
- Must run in an isolated Linux environment (Sandbox).
- CLI interface to output public keys and securely store/retrieve private keys.
- Check SOL and SPL token balances.

### 2. Token Launcher CLI (for Factory)
**Purpose:** Deploy new SPL tokens on Solana.
**Requirements:**
- Primary RPC connection: Helius (Key provided in environment variables).
- Fallback RPC connection: Solana Native Public RPC.
- Must handle retries and error logging if the primary RPC fails.
- Inputs should include Token Name, Symbol, Decimals, and Initial Supply.

### 3. Sniper Data Monitor CLI (for Sniper)
**Purpose:** Monitor and analyze token data. (Note: Sniper does NOT execute trades directly; it relies on external bots like AK.pro for execution).
**Requirements:**
- Integrate `pump.fun` API to track new token launches and metrics.
- Integrate `DexScreener` API for real-time price and liquidity tracking.
- Output clean JSON data that the Sniper agent can parse for its alpha signals.

## Constraints
- **Testing:** All code MUST be tested and reviewed by the Dev Team before submission.
- **Security:** Do not expose private keys in logs or outputs.
- **Review:** Once complete, notify Manager for final deployment to the respective departments.
