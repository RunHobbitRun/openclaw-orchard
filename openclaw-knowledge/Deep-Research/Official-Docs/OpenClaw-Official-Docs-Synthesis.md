# OpenClaw Architecture Master Knowledge Base (Official Docs)

> [!IMPORTANT]
> This knowledge base is synthesized from the official internal `docs/` folder, covering Gateway Architecture, Protocol, Memory Systems, and Plugin Development.

---

## 🏗️ 1. Gateway Architecture & Protocol
The Gateway is the core daemon that orchestrates all messaging surfaces.

### Technical Spec
- **Process**: Single long-lived Node.js process.
- **Bind Host**: Default `127.0.0.1:18789`.
- **Wire Protocol**: JSON over WebSocket (text frames).
- **Handshake**: The first frame **must** be `connect`. Subsequent frames are typed as `req`, `res`, or `event`.

### Connection Lifecycle
1. **req:connect** → Returns `snapshot` (presence + health).
2. **req:agent** → Asynchronous execution returning `runId`.
3. **Streaming**: `assistant` deltas and `tool` events are pushed over the same WS.
4. **Idempotency**: Required for `send` and `agent` via idempotency keys to handle network retries safely.

---

## 🧠 2. Advanced Memory & Search
OpenClaw uses a hybrid memory system combining file-based transcripts and vector search.

### Hybrid RAG (Retrieval Augmented Generation)
- **Vector Search**: Semantic matching using embeddings (default: local GGUF or OpenAI).
- **Text Search**: Keyword matching for exact term retrieval.
- **MMR (Maximal Marginal Relevance)**: Reduces redundancy by ensuring top-K results are semantically diverse.
- **Temporal Decay**: Boosts recency for dated memories (`memory/YYYY-MM-DD.md`) while keeping "evergreen" docs like `MEMORY.md` stable.

### Memory Hierarchy
1. **Evergreen Docs**: `MEMORY.md`, `USER.md`, `AGENTS.md`, `SOUL.md`.
2. **Daily Transcripts**: Logged by date in `memory/`.
3. **Session Logs**: (Experimental) Indexing individual session `jsonl` transcripts.

---

## 🧩 3. Plugin & Extension System
Plugins run in-process with the Gateway and can extend every surface of the agent.

### Extension Points
- **Gateway Methods**: `api.registerGatewayMethod("plugin.method", handler)`.
- **CLI Commands**: `api.registerCli(...)`.
- **Agent Tools**: Define custom tools for the PI runtime.
- **Messaging Channels**: Implement `outbound.sendText` and `capabilities` to add new platforms.

### Lifecycle Hooks
- `gateway_start` / `gateway_stop`
- `before_prompt_build`: Inject context before LLM submission.
- `tool_result_persist`: Intercept and sanitize output before it hits the transcript.
- `agent:bootstrap`: Modify the workspace before the agent wakes up.

---

## 🚀 4. Deployment & Safety
- **Isolation**: VPS or Docker-managed sandboxes are recommended.
- **Auth**: `OPENCLAW_GATEWAY_TOKEN` is the primary guardrail for the WS control plane.
- **Local Approval**: Connects from `loopback` can be auto-approved, but remote connects require explicit pairing via `openclaw pairing approve`.
