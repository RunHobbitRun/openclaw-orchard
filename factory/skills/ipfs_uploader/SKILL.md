---
name: IPFS Uploader
description: Upload generated meme images and metadata JSONs to Pinata IPFS (falls back to Irys Datachain).
tags: ["factory", "ipfs", "pinata", "storage"]
---

# IPFS Uploader

## Execution
Run this tool using the `exec` command:
```bash
node /home/ubuntu/.openclaw/workspace/devteam/built_tools/scripts/ipfs_uploader.mjs "<image_path.png>" "<metadata_path.json>"
```

## Execution Flow
1. Generative AI creates the image and JSON representing the token.
2. Run this upload script to place them on IPFS.
3. Use the outputted `FINAL_METADATA_URI` to execute `token-launcher.js`.
