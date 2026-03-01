# ARCHITECTURAL BLUEPRINTS - MAR 1
**ATTENTION DEVTEAM:** The CEO has issued mandatory architectural blueprints for your current build queue. You must strictly adhere to these patterns.

## 1. Blueprint for MCP Wrappers (`deep_research.js` & `query_knowledge.js`)
*   **The Problem:** Execute agents (Factory/Sniper) cannot natively speak the Model Context Protocol (MCP) to external servers.
*   **The Blueprint:** You must use the `@modelcontextprotocol/sdk` in Node.js to create standard CLI scripts in the `/home/ubuntu/.openclaw/workspace/mcps` folder.
    *   Example: `node query_knowledge.js "Solana Launch Protocols"` must instantiate an MCP client, connect to the running `obsidian-mcp` server, execute the search-vault tool, and `console.log` the raw text string back to standard output.
    *   Apply the exact same pattern for `notebook-mcp` using `node deep_research.js "Topic"`.

## 2. Blueprint for Factory Uploader (`ipfs_uploader.js`)
*   **The Architecture:** Factory relies on decentralized storage. Pinata (IPFS) is primary, but we need guaranteed persistence if IPFS gateways lag.
*   **The Blueprint:** Build a dual-upload script.
    *   **Primary:** Attempt authentication via `/home/ubuntu/.openclaw/workspace/.pinata_keys` and upload the image and JSON to IPFS.
    *   **Fallback:** If the Pinata API fails or responds too slowly, catch the error and automatically fallback to Irys (Arweave).
    *   **Output:** The script MUST return the final `ipfs://` or `ar://` URI to standard output so `token-launcher.js` receives valid metadata.

## 3. Blueprint for SKILL.md Manifests (MANDATORY)
*   **The Problem:** Scripts are useless if an agent doesn't know how or when to execute them.
*   **The Blueprint:** You MUST write a `SKILL.md` instructional manifest for EVERY operational script you finalize (`token-launcher.js`, `sleuth.js`, MCP wrappers, IPFS uploader) and place them in the correct agent's workspace folder (e.g., `/home/ubuntu/.openclaw/workspace/factory/skills/`).
*   **Required Content:**
    *   The exact CLI command syntax (e.g., `node ipfs_uploader.js ./image.png ./meta.json`).
    *   The expected string output.
    *   The absolute business logic defining when the agent is permitted to run the script.

## 4. ADDENDUM: Irys Datachain SDK (TASK-009 Fallback)
Max has provided the exact documentation and package requirements for the Irys fallback to prevent deprecated dependency hallucination.
*   **Docs:** https://docs.irys.xyz/build/d/sdk | https://docs.irys.xyz/build/d/quickstart
*   **CRITICAL DEV INSTRUCTION:** Do NOT use the old `@bundlr-network/client` or raw Arweave SDKs. You MUST use the modular Irys Upload SDK.
*   **Installation:** `npm install @irys/upload @irys/upload-solana`
*   **Execution:** Use the Solana private key (from the Factory workflow) to fund the Irys Node and upload the metadata if the Pinata upload fails.
