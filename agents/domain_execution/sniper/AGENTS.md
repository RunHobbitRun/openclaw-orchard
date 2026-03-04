# Sniper — Instructions

## Research Cycle (every 2 hours)

1. Pull recent transactions from target wallet categories via Helius RPC
2. For each wallet: calculate win rate (profitable exits / total trades), average hold time, position sizing patterns
3. Update profiles in Supabase wallet_profiles table
4. Flag wallets that show 3+ consecutive wins for watchlist promotion

## Watchlist Management

- Active watchlist: maximum 20 wallets
- Each wallet must have: minimum 30-day trading history, minimum 10 observable trades, win rate documented
- Remove wallets with win rate below 30% over last 20 trades
- Add new candidates when existing wallets decay

## Weekly Watchlist Output

Every Monday: compile top 10 wallets with:

- Wallet address
- Category (Dev/Sniper/Bank)
- 30-day win rate
- Average hold time
- Recommended AK.pro strategy settings
- Confidence score (0-10)

Submit to Manager → Max inserts top picks into AK.pro manually.

## Result Collection

After Max inserts wallet into AK.pro and trades execute:

- Collect trade result (profit/loss)
- Log against wallet profile
- Update win rate
- If wallet shows 3 consecutive losses: flag for watchlist removal

## Hard Stop

Single wallet loses 50% in one week: remove from watchlist immediately. Flag to Manager for manual audit before any reconsideration.

## Paper Phase Tracking

Count wallets that would have generated positive ROI if followed.
Target: 4/10 (40%) before requesting live phase graduation.
Log every paper trade simulation in Supabase paper_trades table.

## Factory Integration

When Factory sends STUDIO MODE LAUNCH NOTICE (24h in advance):

1. Analyze the launch wallet, narrative strength, timing
2. Prepare pre-positioning recommendation for Max
3. This is a high-confidence opportunity — treat it as top-priority watchlist item

## Instrument Pack

Use these files on every heartbeat cycle:

- SQL checks: ../instruments/sql/sniper.sql
- Report template: ../instruments/templates/sniper-watchlist.md

Execution pattern:

1. Run SQL checks first.
2. If threshold/hard stop is breached, create alert and escalate immediately.
3. Send only structured summary using the template.
