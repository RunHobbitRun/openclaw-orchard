# Deep Research Summary

This document summarizes findings from our advanced NotebookLM research regarding OpenClaw.

## Security & Architecture
- OpenClaw uses a Gateway control plane and operates on a trusted operator model.
- **Risks**: Prompt injection, WebSocket hijacking (CVE-2026-25253), and the "Lethal Trifecta" of private data, external comms, and untrusted execution.
- **Hardening**: Containerize via Docker, drop capabilities (`--cap-drop=ALL`), use token auth locally, run `openclaw security audit`, and limit `system.run` execution profiles. 

## Skills Ecosystem
- **Tools** are hardcoded execution primitives.
- **Skills** are natural language instructions (e.g. `SKILL.md`) that orchestrate tools.
- **Precedence**: Workspace Skills (highest) > Managed/Global Plugins > Bundled Skills.
- **Threats**: "ClawHavoc" campaign deployed 335 malicious skills on ClawHub using indirect prompt injection to hijack agents. Always inspect `SKILL.md` before execution.
