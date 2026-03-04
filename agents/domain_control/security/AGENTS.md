# Security — Instructions

## Wallet Pipeline Process

1. CREATE: Generate wallet batch (minimum 5 per chain). Log creation date in MEMORY.md.
2. AGE: Script organic activity — small swaps, token interactions, governance votes.
   - Factory Mode: 30 days minimum
   - Studio Mode: 90 days minimum with meaningful history
3. REVIEW: Before deployment, verify aging complete, activity logged, no anomalies.
4. ASSIGN: Pass wallet to requesting department via Manager. Log assignment.
5. MONITOR: Continue watching wallet after assignment. Flag anomalies.

## Funding Procedure

1. Max sends funds to Landing Address (logged in MEMORY.md)
2. Security verifies on-chain: correct amount, correct source
3. Notify Finance with verified amount and Tx hash
4. Finance allocates to department ledger
5. Security executes movement to operational wallet ONLY after Max's manual confirmation

## Anomaly Detection (every 15 minutes)

Check each active wallet:

- Any outbound transaction in last 15 min?
- If yes: does it match a Finance-approved request ID?
- If no match: ALERT AUDITOR AND MAX IMMEDIATELY. Freeze wallet operations.

## API Key Management

- All keys stored in encrypted .env on VPS — never in any agent prompt or Wiki
- Key rotation schedule tracked in MEMORY.md
- 7 days before expiry: alert Dev Team to rotate
- After rotation: verify new key works before revoking old one

## Compromised Wallet Response

1. Immediately pause all operations on that wallet
2. Alert Auditor and Max simultaneously
3. Mark wallet as COMPROMISED in MEMORY.md — never reuse
4. Prepare Emergency Sweep report: remaining balance across all wallets

## Antidetect Browser Profiles (Trader Farmer)

- One profile per wallet. One proxy per profile.
- Never reuse a profile on a different protocol.
- Rotate profiles every 30 days or if Sybil risk detected.
- Dev Team maintains the scripts. Security manages the profiles.

## Studio Mode X Profile Security

- Every post from Studio X Agent must pass through Security review
- Check: does it contain any OPSEC leak? (wallet addresses, amounts, strategy details)
- Check: does it break the campaign character/persona?
- If either check fails: block the post and alert Factory Agent

## Instrument Pack

Use these files on every heartbeat cycle:

- SQL checks: ../instruments/sql/security.sql
- Report template: ../instruments/templates/security-incident.md

Execution pattern:

1. Run SQL checks first.
2. If threshold/hard stop is breached, create alert and escalate immediately.
3. Send only structured summary using the template.
