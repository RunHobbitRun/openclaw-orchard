import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import path from 'path';

const query = process.argv.slice(2).join(" ");
const workspace = process.env.OPENCLAW_WORKSPACE || path.join(process.env.HOME, '.openclaw');
const knowledgeRoot = process.env.OPENCLAW_KNOWLEDGE_ROOT || path.join(process.env.HOME, 'openclaw-knowledge');
const mcpPath = process.env.OBSIDIAN_MCP_PATH || path.join(workspace, 'mcps/obsidian-mcp/build/main.js');

async function main() {
    if (!query) {throw new Error("Missing search query.");}
    const transport = new StdioClientTransport({
        command: "node",
        args: [mcpPath, knowledgeRoot],
        stderr: "ignore"
    });
    const client = new Client({ name: "qclient", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);

    try {
        const result = await client.callTool({ name: "search-vault", arguments: { vault: path.basename(knowledgeRoot), query: query } });
        console.log(result.content.map(c => c.text).join("\n"));
    } finally {
        await client.close();
    }
}
main().catch(e => { console.error("Error:", e.message); process.exit(1); });
