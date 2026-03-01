import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';

const imagePath = process.argv[2];
const jsonPath = process.argv[3];

if (!imagePath || !jsonPath) {
    console.error("Usage: node ipfs_uploader.mjs <image.png> <metadata.json>");
    process.exit(1);
}

const pinataKeysStr = fs.readFileSync("/home/ubuntu/.openclaw/workspace/.pinata_keys", "utf8").trim();
let pinataJwt = pinataKeysStr.includes("JWT=") ? pinataKeysStr.split("JWT=")[1].split("\n")[0].trim() : pinataKeysStr;
if (pinataJwt.startsWith("{")) {
    const parsed = JSON.parse(pinataJwt);
    pinataJwt = parsed.jwt || parsed.JWT || pinataJwt;
}

const envStr = fs.existsSync("/home/ubuntu/.openclaw/workspace/.env") ? fs.readFileSync("/home/ubuntu/.openclaw/workspace/.env", "utf8") : "";
const match = envStr.match(/SOLANA_PRIVATE_KEY=(.+)/);
const solBase58 = match ? match[1].trim() : null;

async function uploadToPinata(filePath, mimeType) {
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
    if (!solBase58) throw new Error("No SOLANA_PRIVATE_KEY for Irys fallback.");
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
        return await uploadToPinata(file, mimeType);
    } catch (err) {
        console.error(`[Error] Pinata upload failed: ${err.message}. Triggering Irys Fallback...`);
        return await uploadToIrys(file, mimeType);
    }
}

async function main() {
    try {
        const imageUri = await uploadFile(imagePath, "image/png");
        console.log(`✅ Image Uploaded: ${imageUri}`);

        const metadata = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
        metadata.image = imageUri;
        const tempJson = `/tmp/meta-${Date.now()}.json`;
        fs.writeFileSync(tempJson, JSON.stringify(metadata, null, 2));

        const metaUri = await uploadFile(tempJson, "application/json");
        console.log(`✅ Metadata Uploaded: ${metaUri}`);

        console.log(`\nFINAL_METADATA_URI=${metaUri}`);
    } catch (e) {
        console.error("❌ Fatal Error:", e.message);
        process.exit(1);
    }
}
main();
