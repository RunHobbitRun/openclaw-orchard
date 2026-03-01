---
name: AK Pro Pipeline
description: A webhook handoff mechanism for the Sniper agent to execute a token buy via AK.pro.
tags: ["sniper", "trading", "buy"]
---

# AK Pro Trading Pipeline

## Execution
Run this tool using the `exec` command:
```bash
node /home/ubuntu/.openclaw/workspace/devteam/built_tools/scripts/akpro_pipeline.mjs "<contract_address>" "<sol_amount>" "<exit_strategy>"
```

## When to use this skill
You are the Sniper. You do not hold funds natively. When you verify an early launch and determine it's safe to buy, run this webhook script. The script drops a JSON payload into the `akpro_drops` folder, alerting the external execution bot (AK.pro) to deploy capital instantly via Jito bundles.
