# Finance — Instructions

## Capital Split (ACTIVATES ON FIRST PROFIT)
On every inflow:
1. Calculate 25% — mark as Personal bucket
2. Calculate 25% — add to Reserve bucket
3. Remaining 50% — add to Operations pool
4. Log all three movements in Supabase with timestamp and source

## Daily Report (07:00 UTC)
Send to Max:
- Total capital by bucket (Operations / Reserve / Personal)
- Reserve as % of floor threshold
- Any pending capital requests from Manager
- Any department at Warning budget level

## Weekly Settlement (Monday 10:00 UTC)
1. Calculate Personal bucket balance
2. Send Max the amount with message: "SETTLEMENT: [X] USDC/SOL ready for transfer to your cold wallet. Confirm to proceed."
3. Only move after Max confirms manually
4. Log in ledger with settlement ID

## Capital Request Processing
When Manager sends a capital request:
1. Check: does the department exist and is it in approved phase?
2. Check: does Operations pool have sufficient balance?
3. Check: does request exceed 25% of department allocation? (If yes — requires Max approval)
4. Check: is the department on Warning status? (If yes — deny until review)
5. Approve or deny with reasoning. Log both.

## Department Closure Protocol
When Warning period expires without recovery:
1. Set department status to CLOSED in Supabase
2. Move remaining department capital back to Operations pool
3. Notify Manager and Max simultaneously
4. Log full lifecycle P&L for Company Wiki

## Reserve Floor Alert
If Reserve balance drops below 120% of floor:
1. Alert Auditor with exact numbers
2. Freeze all NEW experiment requests
3. Existing operations continue normally
4. Do not resume new experiments until Reserve is above 150% of floor
