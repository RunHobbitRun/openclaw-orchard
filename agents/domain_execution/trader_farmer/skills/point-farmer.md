# Point Farmer Skill

Generates high-volume, delta-neutral protocol activity to farm protocol points and airdrop allocations.

## Capabilities

- **Jupiter Flash Swaps**: Executes Token A -> Token B -> Token A cycles (e.g., SOL -> USDC -> SOL) to generate volume without holding directional exposure.
- **Protocol Metrics**: Accumulates transaction history and volume metrics on Jupiter.

## Usage

```bash
# Execute 1 cycle of volume generation
node shared_instruments/scripts/point_farmer.mjs

# Execute multiple cycles
FARMER_ITERATIONS=5 node shared_instruments/scripts/point_farmer.mjs
```

## Environment Requirements

- `SOLANA_PRIVATE_KEY`: Private key for transaction signing.
- `SOLANA_RPC_URL`: Mainnet RPC endpoint (default: public mainnet-beta).
- `FARMER_ITERATIONS`: Number of swap cycles to perform.

## Business Logic

- The **Trader Farmer** is authorized to run this skill when protocol "Point" campaigns are active.
- Ensure the wallet has a sufficient SOL balance for transaction fees and swap principal.
- Use with caution: Mainnet trades incur slippage and network fees.
