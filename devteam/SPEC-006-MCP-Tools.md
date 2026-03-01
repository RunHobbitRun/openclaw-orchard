# Dev Team Specification: MCP Servers Integration (TASK-006)

## Overview
The Antigravity Developer has successfully deployed two internal Model Context Protocol (MCP) servers to the Oracle VPS.
Location: `/home/ubuntu/.openclaw/workspace/mcps`

1. **Obsidian MCP (`obsidian-mcp`)**: Manages the OpenClaw knowledge base.
2. **NotebookLM MCP (`notebook-mcp`)**: Connects to NotebookLM for deep research.

A generated knowledge base from deep research is also available at:
`/home/ubuntu/.openclaw/workspace/openclaw-knowledge/`

## Requirements
To integrate these into the *OpenClaw toolset*, the DevTeam needs to build a Node.js client or shell wrappers to communicate with these MCP servers using `@modelcontextprotocol/sdk`. Since OpenClaw agent config currently only handles standard execution tools, creating a bridging script (e.g., `mcp-client.js`) that agents can call via `system.run` or `exec` is the recommended path.

- Create `query_knowledge.js` that talks to Obsidian MCP.
- Create `deep_research.js` that talks to NotebookLM MCP.

## Status
The servers are compiled and ready. `npm install` has been run on both.
