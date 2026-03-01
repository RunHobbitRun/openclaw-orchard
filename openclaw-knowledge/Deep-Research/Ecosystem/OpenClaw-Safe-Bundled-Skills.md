# Official OpenClaw Skills (Bundled & Verified Safe)

> [!TIP]
> To avoid the supply-chain risks associated with ClawHub's community plugins (e.g., the ClawHavoc vulnerability), the safest approach is to utilize the **Bundled Skills** natively packaged with the OpenClaw repository. 

These skills have been audited, maintain a restricted execution profile, and are natively supported out-of-the-box. Below is a categorized directory of the most powerful and secure bundled skills ready for use:

## 🧑‍💻 Developer & IDE Integration
These skills are invaluable for orchestrating tasks alongside development tools like Antigravity:

*   **`coding-agent`**: Highly recommended. This skill delegates complex coding tasks to background terminal agents (like Codex, Claude Code, or Pi) via pseudo-terminal (PTY) modes. Perfect for batching PR reviews or background compilation without blocking the main event loop.
*   **`github` & `gh-issues`**: Utilizes the `gh` CLI for secure repository management, checking CI/CD pipelines, and filtering PRs natively.
*   **`tmux`**: Allows the agent to multiplex terminal sessions, keeping long-running server scripts or test suites alive in the background safely.

## 🧠 Knowledge Management & Productivity
Tools that allow OpenClaw to directly interface with your local and remote memory bases:

*   **`obsidian`**: Operates on local Markdown vaults via `obsidian-cli`. Extremely safe as it only edits local `.md` files without network exfiltration risks.
*   **`notion`**: Secure API integration for remote workspace management.
*   **`apple-notes` & `bear-notes`**: Native macOS integrations for direct memory extraction from system apps.
*   **`1password`**: Securely extracts necessary API keys and credentials for other skills without storing them plainly in memory.

## 📡 Communications & Social
Native channel integrations that don't rely on third-party scrapers:

*   **`slack`** & **`discord`**: Enterprise and community messaging securely bridged via their official CLIs/APIs.
*   **`bluebubbles` & `imsg`**: Specialized adapters for bridging iMessage directly onto the Gateway.

## 🖥️ System & Hardware Control
Skills that provide the agent with local "Physical Agency" via the Distributed Nodes system:

*   **`camsnap`**: Accesses connected Node cameras.
*   **`openhue`**: Local network control of smart lighting (Philips Hue).
*   **`spotify-player` & `sonoscli`**: Networked media orchestration.

---

### How to use these skills safely:
Because these are bundled, you do not need to `npm install` them from external sources. You simply enable them in your `agents.defaults.skills` configuration array or place them in your agent's local `./skills` directory to grant them highest precedence.

*Note: Even with bundled skills, features that utilize `system.run` (like `coding-agent`) should still be gated behind Exec Approvals (see [OpenClaw-Security-Sandboxing-Exec.md](OpenClaw-Security-Sandboxing-Exec.md)).*