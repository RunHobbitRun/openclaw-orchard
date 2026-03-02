#!/usr/bin/env node
/**
 * IPFS/Arweave Uploader for Factory Ops
 * Uploads token metadata to IPFS via Pinata API
 * 
 * Commands:
 *   upload <file>  - Upload a file to IPFS
 *   pin <cid>      - Pin an existing CID
 * 
 * Keys loaded from: /home/ubuntu/.openclaw/workspace/.pinata_keys
 */

import fs from 'fs';
import path from 'path';

const KEYS_PATH = '/home/ubuntu/.openclaw/workspace/.pinata_keys';
const PINATA_API_URL = 'https://api.pinata.cloud';

// Load Pinata credentials
function loadKeys() {
  const keyContent = fs.readFileSync(KEYS_PATH, 'utf-8');
  const keys = {};
  
  keyContent.split('\n').forEach(line => {
    const match = line.match(/^(\w+)="(.+)"$/);
    if (match) {
      keys[match[1]] = match[2];
    }
  });
  
  if (!keys.PINATA_JWT) {
    throw new Error('PINATA_JWT not found in keys file');
  }
  
  return keys;
}

// Upload a file to IPFS via Pinata
async function uploadFile(filePath) {
  const keys = loadKeys();
  const absolutePath = path.resolve(filePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }
  
  const fileContent = fs.readFileSync(absolutePath);
  const fileName = path.basename(absolutePath);
  
  const formData = new FormData();
  const blob = new Blob([fileContent]);
  formData.append('file', blob, fileName);
  
  const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${keys.PINATA_JWT}`
    },
    body: formData
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata upload failed: ${response.status} ${error}`);
  }
  
  const result = await response.json();
  return {
    cid: result.IpfsHash,
    ipfsUri: `ipfs://${result.IpfsHash}`,
    gatewayUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    pinSize: result.PinSize,
    timestamp: result.Timestamp
  };
}

// Pin an existing CID
async function pinCid(cid) {
  const keys = loadKeys();
  
  const response = await fetch(`${PINATA_API_URL}/pinning/pinByHash`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${keys.PINATA_JWT}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      hashToPin: cid
    })
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Pinata pin failed: ${response.status} ${error}`);
  }
  
  const result = await response.json();
  return {
    cid: result.ipfsHash || cid,
    ipfsUri: `ipfs://${result.ipfsHash || cid}`,
    status: 'pinned'
  };
}

// Main CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
IPFS Uploader for Factory Ops

Usage:
  node ipfs-uploader.mjs upload <file>  - Upload a file to IPFS
  node ipfs-uploader.mjs pin <cid>      - Pin an existing CID

Environment:
  Keys loaded from: ${KEYS_PATH}
`);
    process.exit(0);
  }
  
  try {
    if (command === 'upload') {
      const filePath = args[1];
      if (!filePath) {
        throw new Error('Usage: upload <file>');
      }
      
      console.log(`📤 Uploading: ${filePath}`);
      const result = await uploadFile(filePath);
      
      console.log(`\n✅ Upload successful!`);
      console.log(`   CID: ${result.cid}`);
      console.log(`   IPFS URI: ${result.ipfsUri}`);
      console.log(`   Gateway: ${result.gatewayUrl}`);
      console.log(`   Size: ${result.pinSize} bytes`);
      console.log(`   Timestamp: ${result.timestamp}`);
      
      // Output CID only for scripting
      if (args.includes('--cid-only')) {
        console.log(result.cid);
      }
      
    } else if (command === 'pin') {
      const cid = args[1];
      if (!cid) {
        throw new Error('Usage: pin <cid>');
      }
      
      console.log(`📌 Pinning CID: ${cid}`);
      const result = await pinCid(cid);
      
      console.log(`\n✅ Pin successful!`);
      console.log(`   CID: ${result.cid}`);
      console.log(`   IPFS URI: ${result.ipfsUri}`);
      
    } else {
      throw new Error(`Unknown command: ${command}`);
    }
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();