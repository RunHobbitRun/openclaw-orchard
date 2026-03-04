# Wallet Aging Skill

Simulates organic wallet activity on Solana to establish transaction history for new wallets.

## Capabilities
- Small random SOL transfers to generated addresses.
- Configurable iterations.
- Automatic logging to Supabase `agent_actions`.

## Usage
```bash
node shared_instruments/scripts/wallet-aging.mjs
```

## Environment
- `SOLANA_PRIVATE_KEY`: Private key in JSON array or base58.
- `WALLET_AGING_ITERATIONS`: Number of swaps (default 3).
