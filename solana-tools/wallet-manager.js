#!/usr/bin/env node
/**
 * Wallet Manager CLI - Secure Solana Wallet Management
 * Usage: node wallet-manager.js [command] [options]
 * 
 * Commands:
 *   generate           Generate a new wallet
 *   list               List all stored wallets
 *   balance <address>  Check SOL/SPL balance
 *   airdrop <address>  Request SOL airdrop (devnet only)
 */

const fs = require('fs');
const path = require('path');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const axios = require('axios');

// Config
const WALLET_DIR = path.join(__dirname, 'wallets');
const HELIUS_RPC = process.env.HELIUS_API_KEY 
  ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
  : 'https://api.mainnet-beta.solana.com';
const DEVNET_RPC = 'https://api.devnet.solana.com';

// Ensure wallet directory exists (restricted permissions)
if (!fs.existsSync(WALLET_DIR)) {
  fs.mkdirSync(WALLET_DIR, { mode: 0o700 });
}

// Helper: Encode/decode private key (base64 - not encryption, sandbox use only)
function encodePrivateKey(secretKey) {
  return Buffer.from(secretKey).toString('base64');
}

function decodePrivateKey(encoded) {
  return new Uint8Array(Buffer.from(encoded, 'base64'));
}

// Commands
const commands = {
  generate: async (args) => {
    const network = args.includes('--devnet') ? 'devnet' : 'mainnet';
    const keypair = Keypair.generate();
    const publicKey = keypair.publicKey.toBase58();
    
    // Encode private key (base64 encoding - not encryption)
    const encodedPrivateKey = encodePrivateKey(keypair.secretKey);
    
    const walletData = {
      publicKey,
      encodedPrivateKey,
      network,
      createdAt: new Date().toISOString()
    };
    
    const walletPath = path.join(WALLET_DIR, `${publicKey}.json`);
    fs.writeFileSync(walletPath, JSON.stringify(walletData, null, 2));
    
    console.log('\n✅ Wallet Generated Successfully');
    console.log(`   Network: ${network}`);
    console.log(`   Public Key: ${publicKey}`);
    console.log(`   ⚠️  Private key encoded at: ${walletPath}`);
    console.log('   ⚠️  NEVER share your private key or store in plain text\n');
    
    return { publicKey, network };
  },
  
  list: async (args) => {
    const files = fs.readdirSync(WALLET_DIR).filter(f => f.endsWith('.json'));
    
    if (files.length === 0) {
      console.log('No wallets found.');
      return [];
    }
    
    console.log('\n📋 Stored Wallets:\n');
    const wallets = [];
    
    for (const file of files) {
      const data = JSON.parse(fs.readFileSync(path.join(WALLET_DIR, file), 'utf8'));
      wallets.push({ publicKey: data.publicKey, network: data.network });
      console.log(`   ${data.publicKey.slice(0,8)}...${data.publicKey.slice(-4)} [${data.network}]`);
      console.log(`   Created: ${data.createdAt}\n`);
    }
    
    return wallets;
  },
  
  balance: async (args) => {
    const address = args[0];
    if (!address) {
      throw new Error('Please provide a wallet address: balance <address>');
    }
    
    const network = args.includes('--devnet') ? 'devnet' : 'mainnet';
    const rpcUrl = network === 'devnet' ? DEVNET_RPC : HELIUS_RPC;
    const connection = new Connection(rpcUrl);
    
    try {
      const publicKey = new PublicKey(address);
      
      // Get SOL balance
      const solBalance = await connection.getBalance(publicKey);
      const solLamports = solBalance / 1e9;
      
      console.log('\n💰 Balance Check');
      console.log(`   Address: ${address}`);
      console.log(`   Network: ${network}`);
      console.log(`   SOL Balance: ${solLamports.toFixed(4)} SOL`);
      
      // Get token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(publicKey, {
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
      });
      
      if (tokenAccounts.value.length > 0) {
        console.log('\n   📌 SPL Tokens:');
        for (const account of tokenAccounts.value) {
          const mint = account.account.data.parsed.info.mint;
          const amount = account.account.data.parsed.info.tokenAmount.uiAmountString;
          console.log(`      ${mint.slice(0,8)}...${mint.slice(-4)}: ${amount}`);
        }
      }
      
      console.log('');
      return { sol: solLamports, tokens: tokenAccounts.value.length };
    } catch (err) {
      throw new Error(`Failed to get balance: ${err.message}`);
    }
  },
  
  airdrop: async (args) => {
    const address = args[0];
    if (!address) {
      throw new Error('Please provide a wallet address: airdrop <address>');
    }
    
    const connection = new Connection(DEVNET_RPC);
    
    try {
      const publicKey = new PublicKey(address);
      const sig = await connection.requestAirdrop(publicKey, 1e9);
      await connection.confirmTransaction(sig);
      
      console.log(`\n✅ Airdrop successful! 1 SOL sent to ${address}`);
      console.log(`   Signature: ${sig}\n`);
      return { success: true, signature: sig };
    } catch (err) {
      throw new Error(`Airdrop failed: ${err.message}`);
    }
  }
};

// Main
async function main() {
  const cmd = process.argv[2];
  const args = process.argv.slice(3);
  
  if (!cmd || !commands[cmd]) {
    console.log(`
Solana Wallet Manager CLI
Usage: node wallet-manager.js <command> [options>

Commands:
  generate              Generate a new wallet
  list                  List all stored wallets  
  balance <address>     Check SOL/SPL balance
  airdrop <address>     Request SOL airdrop (devnet only)

Options:
  --devnet              Use devnet instead of mainnet

Examples:
  node wallet-manager.js generate --devnet
  node wallet-manager.js balance <PUBLIC_KEY>
  node wallet-manager.js list
`);
    process.exit(1);
  }
  
  try {
    await commands[cmd](args);
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}\n`);
    process.exit(1);
  }
}

main();
