import fs from 'fs';
import path from 'path';

const ca = process.argv[2];
const sol = process.argv[3];
const strat = process.argv[4] || "default";

if (!ca || !sol) {
    console.error("Usage: node akpro_pipeline.mjs <ContractAddress> <SolAmount> [ExitStrategy]");
    process.exit(1);
}

const outDir = "/home/ubuntu/.openclaw/workspace/sniper/akpro_drops";
if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
}

const payload = {
    target_contract: ca,
    amount_sol: parseFloat(sol),
    target_strategy: strat,
    timestamp: new Date().toISOString()
};

const fpath = path.join(outDir, `buy_${ca}_${Date.now()}.json`);
fs.writeFileSync(fpath, JSON.stringify(payload, null, 2));
console.log(`✅ Webhook Payload generated: ${fpath}. External sniper (AK.pro) alerted.`);
