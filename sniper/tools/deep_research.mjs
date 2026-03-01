import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const topic = process.argv.slice(2).join(" ");

async function main() {
    if (!topic) throw new Error("Missing topic.");
    const transport = new StdioClientTransport({
        command: "node",
        args: ["/home/ubuntu/.openclaw/workspace/mcps/notebook-mcp/build/index.js"]
    });
    const client = new Client({ name: "rclient", version: "1.0.0" }, { capabilities: {} });
    await client.connect(transport);

    try {
        const result = await client.callTool({ name: "perform_deep_research", arguments: { topic: topic, duration: "medium" } });
        if (result.isError) throw new Error(result.content.map(c => c.text).join());
        console.log(result.content.map(c => c.text).join("\n"));
    } finally {
        await client.close();
    }
}
main().catch(e => { console.error("Error:", e.message); process.exit(1); });
