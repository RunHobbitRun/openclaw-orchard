import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const query = process.argv.slice(2).join(" ");

async function main() {
    if (!query) throw new Error("Missing search query.");
    const transport = new StdioClientTransport({
        command: "node",
        args: ["/home/ubuntu/.openclaw/workspace/mcps/obsidian-mcp/build/main.js", "/home/ubuntu/openclaw-knowledge"],
        stderr: "ignore"
    });
    const client = new Client({ name: "qclient", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);

    try {
        const result = await client.callTool({ name: "search-vault", arguments: { vault: "openclaw-knowledge", query: query } });
        if (result.isError) throw new Error(result.content.map(c => c.text).join());
        console.log(result.content.map(c => c.text).join("\n"));
    } finally {
        await client.close();
    }
}
main().catch(e => { console.error("Error:", e.message); process.exit(1); });
