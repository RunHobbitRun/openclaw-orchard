# OpenClaw Security: Sandboxing and Exec Approvals

> [!CAUTION]
> OpenClaw operates with significant host permissions. Proper sandboxing and execution approvals are the primary line of defense against the "Lethal Trifecta" of agentic risks.

---

## 🛡️ 1. Docker-Based Sandboxing
By default, the OpenClaw Gateway runs directly on the host, but **tool execution** (like `exec`, `read`, `write`, `browser`) can be routed into isolated Docker containers to reduce the blast radius.

### Configuration (`agents.defaults.sandbox`)
- **Mode**:
  - `off`: No sandboxing. All tools run on the host.
  - `non-main`: Sandboxes only non-main sessions (e.g., group chats). Main operator chats stay on the host.
  - `all`: Every session runs inside a container.
- **Scope**:
  - `session`: (Default) One container instantiated per session.
  - `agent`: One container shared per agent.
  - `shared`: A global container for all sandboxed sessions.
- **Workspace Access**:
  - `none`: (Default) The sandbox gets a blank mirror. Workspace skills are copied over to be readable.
  - `ro`: Mounts the host workspace read-only (`/agent`).
  - `rw`: Mounts the host workspace read-write (`/workspace`).

### Network Isolation
- Sandbox containers run with **no network ingress/egress** by default (`"none"`).
- The **Sandboxed Browser tool** uses a dedicated network (`openclaw-sandbox-browser`) rather than the global bridge, ensuring Chrome DevTools Protocol (CDP) access is segmented.

---

## 🚦 2. Exec Approvals (Safety Interlocks)
Exec approvals serve as a "companion app / node host" guardrail. They act as a mandatory safety interlock before `system.run` (shell execution) commands are allowed on a host. 

### Levels of Enforcement (`exec.security`)
- **deny**: Hard block on all host execution requests.
- **allowlist**: Only allows commands that match specific glob patterns resolving to binary paths (e.g., `~/Projects/**/bin/rg`).
- **full**: Allows everything (equivalent to elevated / root).

### User Prompts (`exec.ask`)
When an agent attempts to execute a command, operators can be prompted via local IPC (macOS Companion App) or via Chat Channel forwarding:
- `off`: Never prompt.
- `on-miss`: Prompt **only** when the command does not match the allowlist.
- `always`: Prompt on every command.

### Safe Bins (Stdin-only fast path)
Commands configured in `exec.safeBins` (e.g., `jq`, `cut`, `wc`, `tail`) bypass explicit allowlists **if and only if** they are entirely stdin-based. 
- OpenClaw rigidly blocks any flags that attempt to read files (e.g., `jq -f`, `grep -r`, `sort -o`).
- Interpreter binaries (`bash`, `python`, `node`) are strictly forbidden from the `safeBins` list because they can evaluate arbitrary code.

---

## 🤖 3. Auto-Allow Skill Executables
For smooth UX, local trusted environments can set `autoAllowSkills: true`. This dynamically patches the execution allowlist by traversing `skills.bins` via RPC, extracting CLI binaries required by installed skills, and permitting them to run without manual prompt interruption.

> *Note: This is an implicit trust model. If strict security is required zero-trust networks, `autoAllowSkills` must be kept false.*