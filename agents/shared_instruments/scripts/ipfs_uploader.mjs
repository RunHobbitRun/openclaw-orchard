import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import path from 'path';

const imagePath = process.argv[2];
const jsonPath = process.argv[3];
const workspace = process.env.OPENCLAW_WORKSPACE || path.join(process.env.HOME, '.openclaw');

if (!imagePath || !jsonPath) {
    console.error("Usage: node ipfs_uploader.mjs <image.png> <metadata.json>");
    process.exit(1);
}

// Load Pinata JWT from various possible locations
function loadPinataJwt() {
    const possiblePaths = [
        path.join(workspace, '.pinata_keys'),
        path.join(workspace, 'workspace/.pinata_keys'),
        path.join(process.env.HOME, '.pinata_keys')
    ];
    for (const p of possiblePaths) {
        if (fs.existsSync(p)) {
            const content = fs.readFileSync(p, "utf8").trim();
            if (content.includes("JWT=")) { return content.split("JWT=")[1].split("\n")[0].trim(); }
            try {
                const parsed = JSON.parse(content);
                return parsed.jwt || parsed.JWT || content;
            } catch { return content; }
        }
    }
    return process.env.PINATA_JWT;
}

const pinataJwt = loadPinataJwt();
const solBase58 = process.env.SOLANA_PRIVATE_KEY;

async function uploadToPinata(filePath) {
    if (!pinataJwt) { throw new Error("No Pinata JWT found."); }
    const data = new FormData();
    data.append('file', fs.createReadStream(filePath));
    const response = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", data, {
        maxBodyLength: "Infinity",
        headers: {
            'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
            'Authorization': `Bearer ${pinataJwt}`
        }
    });
    return `ipfs://${response.data.IpfsHash}`;
}

async function uploadToIrys(filePath, mimeType) {
    if (!solBase58) { throw new Error("No SOLANA_PRIVATE_KEY for Irys fallback."); }
    const { Uploader } = await import("@irys/upload");
    const { Solana } = await import("@irys/upload-solana");
    const irys = await Uploader(Solana(solBase58)).withRpc("mainnet-beta");
    const dataToUpload = fs.readFileSync(filePath);
    const receipt = await irys.upload(dataToUpload, { tags: [{ name: "Content-Type", value: mimeType }] });
    return `https://gateway.irys.xyz/${receipt.id}`;
}

async function uploadFile(file, mimeType) {
    try {
        console.log(`[Primary] Uploading ${file} to Pinata...`);
        return await uploadToPinata(file);
    } catch (err) {
        console.error(`[Error] Pinata failed: ${err.message}. Irys Fallback...`);
        return await uploadToIrys(file, mimeType);
    }
}

async function main() {
    const imageUri = await uploadFile(imagePath, "image/png");
    const metadata = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
    metadata.image = imageUri;
    const tempJson = path.join('/tmp', `meta-${Date.now()}.json`);
    fs.writeFileSync(tempJson, JSON.stringify(metadata, null, 2));
    const metaUri = await uploadFile(tempJson, "application/json");
    console.log(`\nFINAL_METADATA_URI=${metaUri}`);
}
main().catch(e => { console.error("❌ Fatal:", e.message); process.exit(1); });
