# IPFS & Metadata Uploader Skill

Handles dual-provider IPFS uploads for decentralized application data (e.g., Solana token metadata).

## Capabilities
- Primary: Pinata (IPFS)
- Fallback: Irys (Arweave/Solana)
- Automatic image-to-metadata URI injection.

## Usage
```bash
node shared_instruments/scripts/ipfs_uploader.mjs <image.png> <metadata.json>
```

## Output
The script outputs `FINAL_METADATA_URI=<uri>` on completion.
