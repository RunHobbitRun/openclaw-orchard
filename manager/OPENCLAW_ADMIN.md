# OpenClaw Administration Guide — For Manager Agent

> **CRITICAL**: Read this ENTIRE document before modifying ANY config.
> Every crash in the gateway has been caused by writing invalid keys to openclaw.json.
> Use the CLI commands below instead of raw JSON editing whenever possible.

---

## 1. GOLDEN RULES

1. **NEVER add unknown keys** to openclaw.json. If a key is not listed in this document, it will crash the gateway.
2. **ALWAYS run `openclaw doctor`** after any config change to validate before restarting.
3. **NEVER run `openclaw gateway restart`** — the gateway is managed by systemd. Use: `sudo systemctl restart openclaw-gateway`
4. **ALWAYS validate JSON** before writing: `node -e "JSON.parse(require('fs').readFileSync('/home/ubuntu/.openclaw/openclaw.json','utf8'))"`
5. **Use CLI commands** instead of editing JSON directly when possible.
6. **ALWAYS backup** before editing: `cp /home/ubuntu/.openclaw/openclaw.json /home/ubuntu/.openclaw/openclaw.json.backup`

---

## 2. CLI COMMANDS REFERENCE

### Change an agent model
```bash
openclaw config set "agents.list[0].model" "google/gemini-3.1-pro"
# Index: 0=manager, 1=auditor, 2=finance, 3=intelligence, 4=security,
#        5=scout, 6=devteam, 7=factory, 8=sniper, 9=trader_farmer,
#        10=trader_quant, 11=prediction_god
```

### List available models
```bash
openclaw models list --all              # all known models
openclaw models list --all | grep google  # filter by provider
openclaw models list                    # only configured/authed models
```

### Set model fallbacks (global)
```bash
openclaw models fallbacks add "google/gemini-2.5-flash"
openclaw models fallbacks list
openclaw models fallbacks remove "google/gemini-2.5-flash"
openclaw models fallbacks clear
```

### Get/set any config value
```bash
openclaw config get "agents.list[0].model"
openclaw config set "tools.exec.security" "deny"
```

### Health check
```bash
openclaw doctor          # check for issues
openclaw doctor --fix    # auto-fix known issues
```

### Restart gateway (CORRECT way)
```bash
sudo systemctl restart openclaw-gateway
```

### Check gateway status
```bash
sudo systemctl status openclaw-gateway --no-pager
```

### Check channel status
```bash
source /home/ubuntu/.openclaw/.env
OPENCLAW_GATEWAY_TOKEN="$OPENCLAW_AUTH_TOKEN" openclaw channels status
```

---

## 3. AGENT CONFIG SCHEMA (agents.list[])

Each agent in `agents.list[]` accepts ONLY these keys:

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `id` | string | YES | Agent identifier (e.g. "manager") |
| `name` | string | no | Display name |
| `default` | boolean | no | Is this the default agent? |
| `workspace` | string | no | Workspace path |
| `agentDir` | string | no | Agent data directory |
| `model` | string or object | no | Model id (e.g. "google/gemini-3.1-pro") |
| `skills` | string[] | no | Allowlist of skills |
| `tools` | AgentToolsConfig | no | Per-agent tool restrictions (see Section 4) |
| `sandbox` | object | no | Sandbox overrides |
| `params` | object | no | Stream params (temperature, etc.) |
| `identity` | object | no | Identity (emoji, theme, avatar) |
| `heartbeat` | object | no | Heartbeat overrides |
| `subagents` | object | no | Sub-agent permissions |
| `groupChat` | object | no | Group chat config |
| `memorySearch` | object | no | Memory search config |
| `humanDelay` | object | no | Delay between replies |

### INVALID agent keys (will crash gateway):
- `tools.exec.enabled` — NO SUCH KEY
- `tools.exec.allowedAgents` — NO SUCH KEY
- `agentId` — NOT valid in agent config
- Any key not listed above

---

## 4. AGENT TOOLS CONFIG (agents.list[].tools)

To restrict tools for a specific agent, add a `tools` key:

```json
{
  "id": "auditor",
  "model": "ollama_cloud/glm-5:cloud",
  "tools": {
    "profile": "minimal",
    "deny": ["exec", "write", "edit"]
  }
}
```

### Valid keys under `agents.list[].tools`:

| Key | Type | Description |
|-----|------|-------------|
| `profile` | "minimal" / "coding" / "messaging" / "full" | Base tool profile |
| `allow` | string[] | Tools to explicitly allow |
| `alsoAllow` | string[] | Additional tools to merge into allow |
| `deny` | string[] | Tools to deny |
| `exec` | ExecToolConfig | Exec-specific config (see below) |
| `fs` | object | Filesystem guards: `{workspaceOnly: true}` |
| `elevated` | object | Elevated exec permissions |
| `byProvider` | object | Per-model tool overrides |
| `loopDetection` | object | Loop detection settings |

### Valid keys under `agents.list[].tools.exec`:

| Key | Type | Description |
|-----|------|-------------|
| `host` | "sandbox" / "gateway" / "node" | Where to run commands |
| `security` | "deny" / "allowlist" / "full" | Exec security mode |
| `ask` | "off" / "on-miss" / "always" | Approval mode |
| `node` | string | Default node binding |
| `backgroundMs` | number | Background timeout |
| `timeoutSec` | number | Kill timeout |

### INVALID tools keys (will crash gateway):
- `tools.exec.enabled` — DOES NOT EXIST
- `tools.exec.allowedAgents` — DOES NOT EXIST

### How to disable exec for an agent:
```json
{
  "tools": {
    "deny": ["exec"]
  }
}
```

### How to restrict exec to allowlist mode:
```json
{
  "tools": {
    "exec": {
      "security": "deny"
    }
  }
}
```

---

## 5. MODEL PROVIDERS (models.providers)

Each provider in `models.providers` MUST have a `models` array. Without it, the gateway crashes immediately.

### Valid provider config:

```json
{
  "models": {
    "providers": {
      "my_provider": {
        "baseUrl": "https://api.example.com/v1",
        "api": "openai-completions",
        "apiKey": "sk-your-key-here",
        "models": [
          {
            "id": "model-name",
            "name": "Display Name",
            "input": ["text", "image"],
            "contextWindow": 131072,
            "maxTokens": 8192
          }
        ]
      }
    }
  }
}
```

### CRASH RULES:
- **`models` array is REQUIRED** — omitting it crashes the gateway
- **`apiKey` must be a plain string** — NOT `{"source": "env", "id": "..."}` 
- **`api` must be valid** — use `"openai-completions"` or `"anthropic-messages"`

### Currently configured providers:
- `google/` — Built-in, uses GEMINI_API_KEY env var
- `openrouter/` — Built-in, uses OPENROUTER_API_KEY env var  
- `opencode` — Custom, baseUrl: https://opencode.ai/zen/v1
- `ollama_cloud` — Custom, baseUrl: https://ollama.com/v1
- `moonshot` — Custom, baseUrl: https://api.moonshot.ai/v1

---

## 6. TELEGRAM ACCOUNTS

### Valid keys under `channels.telegram.accounts.*`:

| Key | Type | Description |
|-----|------|-------------|
| `botToken` | string | Bot token from @BotFather |
| `dmPolicy` | "pairing" / "allowlist" / "open" / "disabled" | DM policy |
| `enabled` | boolean | Enable/disable this bot |
| `streaming` | "off" / "partial" / "block" | Streaming mode |
| `allowFrom` | array | Allowed user IDs |
| `name` | string | Display name |
| `groups` | object | Group configs |

### INVALID telegram keys:
- `agentId` — Use `bindings[]` instead (see below)

### Agent-to-Telegram routing uses `bindings`:
```json
{
  "bindings": [
    {
      "agentId": "manager",
      "match": { "channel": "telegram", "accountId": "default" }
    }
  ]
}
```

---

## 7. SAFE CONFIG EDIT PROCEDURE

When you MUST edit openclaw.json directly:

```bash
# Step 1: Backup
cp /home/ubuntu/.openclaw/openclaw.json /home/ubuntu/.openclaw/openclaw.json.backup

# Step 2: Edit with jq (safe JSON manipulation)
jq '.agents.list[0].model = "google/gemini-3.1-pro"' \
  /home/ubuntu/.openclaw/openclaw.json > /tmp/openclaw.json.tmp

# Step 3: Validate JSON syntax
node -e "JSON.parse(require('fs').readFileSync('/tmp/openclaw.json.tmp','utf8')); console.log('JSON valid')"

# Step 4: Apply and validate with doctor
cp /tmp/openclaw.json.tmp /home/ubuntu/.openclaw/openclaw.json
openclaw doctor 2>&1 | grep -iE "error|invalid|complete"

# Step 5: If doctor says errors, RESTORE backup immediately:
cp /home/ubuntu/.openclaw/openclaw.json.backup /home/ubuntu/.openclaw/openclaw.json

# Step 6: Only restart if doctor passes with 0 errors:
sudo systemctl restart openclaw-gateway
```

---

## 8. ENV VARS (.env)

Location: `/home/ubuntu/.openclaw/.env`

The systemd service reads this file on start. After editing .env, restart:
```bash
sudo systemctl restart openclaw-gateway
```

Current env vars:
- `GEMINI_API_KEY` — Google Gemini API
- `OPENROUTER_API_KEY` — OpenRouter API
- `DEEPSEEK_API_KEY` — DeepSeek API
- `PERPLEXITY_API_KEY` — Perplexity search
- `OPENCODE_API_KEY` — Opencode.ai API
- `OLLAMA_API_KEY` — Ollama Cloud API
- `KIMI_API_CODE` — Moonshot/Kimi API
- `OPENCLAW_AUTH_TOKEN` — Gateway auth
- `OPENCLAW_GATEWAY_TOKEN` — Gateway token (must match AUTH_TOKEN)
- `HELIUS_API_KEY` — Helius (Solana)
- `TELEGRAM_BOT_TOKEN` — Default Telegram bot
- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` — Supabase

---

## 9. COMMON MISTAKES AND FIXES

| Mistake | Error | Fix |
|---------|-------|-----|
| Missing `models` array in provider | "expected array" | Add `models: [...]` with at least one model definition |
| `apiKey: {source: "env"}` in providers | "Invalid input" | Use plain string: `"apiKey": "sk-..."` |
| `tools.exec.enabled: false` on agent | "Unrecognized key: enabled" | Use `"tools": {"deny": ["exec"]}` |
| `agentId` in telegram account | "Unrecognized key: agentId" | Use `bindings[]` array instead |
| Running `openclaw gateway restart` | Duplicate processes | Use `sudo systemctl restart openclaw-gateway` |
| Editing config without validation | Gateway crash loop | Always run `openclaw doctor` after edits |
| Adding custom keys to agent config | "Unrecognized key" | Only use keys listed in Section 3 |
