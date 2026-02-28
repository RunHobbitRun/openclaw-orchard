#!/usr/bin/env node
/**
 * Token Launcher CLI - Deploy SPL Tokens on Solana
 */

const fs = require('fs');
const path = require('path');
const { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction, 
  SystemProgram 
} = require('@solana/web3.js');
const { 
  createInitializeMintInstruction, 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  getMint,
  getAccount
} = require('@solana/spl-token');

const WALLET_DIR = path.join(__dirname, 'wallets');
const HELIUS_RPC_MAINNET = process.env.HELIUS_API_KEY 
  ? `https://mainnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
  : null;
const SOLANA_RPC_MAINNET = 'https://api.mainnet-beta.solana.com';
const HELIUS_RPC_DEVNET = process.env.HELIUS_API_KEY 
  ? `https://devnet.helius-rpc.com/?api-key=${process.env.HELIUS_API_KEY}`
  : null;
const SOLANA_RPC_DEVNET = 'https://api.devnet.solana.com';

async function getConnection(network = 'mainnet') {
  const isDevnet = network === 'devnet';
  const rpcs = isDevnet 
    ? [HELIUS_RPC_DEVNET, SOLANA_RPC_DEVNET]
    : [HELIUS_RPC_MAINNET, SOLANA_RPC_MAINNET];
  
  for (const rpcUrl of rpcs) {
    if (!rpcUrl) continue;
    try {
      const conn = new Connection(rpcUrl, { commitment: 'confirmed' });
      await conn.getVersion();
      console.log(`   Using RPC: ${rpcUrl.split('?')[0]}`);
      return conn;
    } catch (e) {
      console.log(`   RPC failed: ${rpcUrl.split('?')[0]}`);
    }
  }
  throw new Error('All RPC endpoints failed');
}

function loadKeypair(walletPath) {
  const wallet = JSON.parse(fs.readFileSync(walletPath, 'utf8'));
  const secretArray = Uint8Array.from(Buffer.from(wallet.encodedPrivateKey, 'base64'));
  return Keypair.fromSecretKey(secretArray);
}

function findWallet(address) {
  const files = fs.readdirSync(WALLET_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const wallet = JSON.parse(fs.readFileSync(path.join(WALLET_DIR, file), 'utf8'));
    if (wallet.publicKey === address || wallet.publicKey.startsWith(address)) {
      return path.join(WALLET_DIR, file);
    }
  }
  return null;
}

function parseArgs(args) {
  const opts = {};
  const cleanArgs = [];
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--name' && args[i + 1]) opts.name = args[++i];
    else if (args[i] === '--symbol' && args[i + 1]) opts.symbol = args[++i];
    else if (args[i] === '--decimals' && args[i + 1]) opts.decimals = parseInt(args[++i]);
    else if (args[i] === '--supply' && args[i + 1]) opts.supply = args[++i];
    else if (args[i] === '--devnet') opts.devnet = true;
    else cleanArgs.push(args[i]);
  }
  return { opts, args: cleanArgs };
}

const commands = {
  create: async (args, opts) => {
    const network = opts.devnet ? 'devnet' : 'mainnet';
    const mintAuthority = args[0];
    
    if (!mintAuthority) {
      throw new Error('Please provide mint authority address: create <mintAuthority>');
    }
    
    console.log(`\n🚀 Creating Token (${network})`);
    console.log(`   Mint Authority: ${mintAuthority}`);
    console.log(`   Name: ${opts.name || 'Unnamed Token'}`);
    console.log(`   Symbol: ${opts.symbol || 'UNT'}`);
    console.log(`   Decimals: ${opts.decimals || 9}`);
    
    const connection = await getConnection(network);
    
    let payer;
    const walletPath = findWallet(mintAuthority);
    if (walletPath) {
      payer = loadKeypair(walletPath);
      console.log(`   Payer: ${payer.publicKey.toBase58()}`);
    } else {
      payer = Keypair.generate();
      console.log(`   ⚠️  Payer not found in wallet dir. Using generated key:`);
      console.log(`   ⚠️  ${payer.publicKey.toBase58()}`);
      console.log(`   ⚠️  Fund this address before continuing!`);
      return { warning: 'Fund the payer address and try again' };
    }
    
    const mintKeypair = Keypair.generate();
    const mint = mintKeypair.publicKey;
    const decimals = opts.decimals || 9;
    
    console.log(`   Mint Address: ${mint.toBase58()}`);
    
    try {
      const lamports = await connection.getMinimumBalanceForRentExemption(82);
      
      const transaction = new Transaction();
      
      transaction.add(
        SystemProgram.createAccount({
          fromPubkey: payer.publicKey,
          newAccountPubkey: mint,
          space: 82,
          lamports,
          programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        }),
        createInitializeMintInstruction(
          mint,
          decimals,
          new PublicKey(mintAuthority),
          null,
          new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
        )
      );
      
      if (opts.supply) {
        const receiver = new PublicKey(mintAuthority);
        const ata = await getAssociatedTokenAddress(mint, receiver);
        
        transaction.add(
          createAssociatedTokenAccountInstruction(payer.publicKey, ata, receiver, mint),
          createMintToInstruction(mint, ata, new PublicKey(mintAuthority), parseFloat(opts.supply) * Math.pow(10, decimals))
        );
        console.log(`   Initial Supply: ${opts.supply} tokens to ${mintAuthority}`);
      }
      
      console.log(`   Sending transaction...`);
      const signature = await connection.sendTransaction(transaction, [payer, mintKeypair], {
        skipPreflight: false,
        preflightCommitment: 'confirmed'
      });
      
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log(`\n✅ Token Created Successfully!`);
      console.log(`   Mint Address: ${mint.toBase58()}`);
      console.log(`   Signature: ${signature}`);
      console.log(`   Explorer: https://solscan.io/token/${mint.toBase58()}${network === 'devnet' ? '?cluster=devnet' : ''}\n`);
      
      const tokenInfo = {
        mint: mint.toBase58(),
        name: opts.name,
        symbol: opts.symbol,
        decimals,
        authority: mintAuthority,
        network,
        createdAt: new Date().toISOString(),
        signature
      };
      fs.writeFileSync(
        path.join(__dirname, 'tokens', `${mint.toBase58()}.json`),
        JSON.stringify(tokenInfo, null, 2)
      );
      
      return tokenInfo;
    } catch (err) {
      throw new Error(`Failed to create token: ${err.message}`);
    }
  },
  
  mint: async (args, opts) => {
    const network = opts.devnet ? 'devnet' : 'mainnet';
    const mint = args[0];
    const receiver = args[1];
    
    if (!mint || !receiver) {
      throw new Error('Usage: mint <mintAddress> <receiverAddress> --supply <amount>');
    }
    if (!opts.supply) {
      throw new Error('Please specify --supply <amount>');
    }
    
    const connection = await getConnection(network);
    
    const walletFiles = fs.readdirSync(WALLET_DIR).filter(f => f.endsWith('.json'));
    if (walletFiles.length === 0) {
      throw new Error('No wallet found. Generate a wallet first.');
    }
    
    const payer = loadKeypair(path.join(WALLET_DIR, walletFiles[0]));
    const mintPubkey = new PublicKey(mint);
    const receiverPubkey = new PublicKey(receiver);
    
    console.log(`\n💰 Minting Tokens (${network})`);
    console.log(`   Mint: ${mint}`);
    console.log(`   Receiver: ${receiver}`);
    console.log(`   Amount: ${opts.supply}`);
    
    try {
      const mintInfo = await getMint(connection, mintPubkey);
      const decimals = mintInfo.decimals;
      const amount = parseFloat(opts.supply) * Math.pow(10, decimals);
      
      const ata = await getAssociatedTokenAddress(mintPubkey, receiverPubkey);
      
      const transaction = new Transaction();
      
      try {
        await getAccount(connection, ata);
      } catch {
        transaction.add(createAssociatedTokenAccountInstruction(payer.publicKey, ata, receiverPubkey, mintPubkey));
      }
      
      transaction.add(createMintToInstruction(mintPubkey, ata, payer.publicKey, amount));
      
      const signature = await connection.sendTransaction(transaction, [payer], { skipPreflight: false });
      await connection.confirmTransaction(signature, 'confirmed');
      
      console.log(`\n✅ Minted ${opts.supply} tokens to ${receiver}`);
      console.log(`   Signature: ${signature}\n`);
      
      return { success: true, signature };
    } catch (err) {
      throw new Error(`Minting failed: ${err.message}`);
    }
  },
  
  info: async (args, opts) => {
    const network = opts.devnet ? 'devnet' : 'mainnet';
    const mint = args[0];
    
    if (!mint) {
      throw new Error('Please provide mint address: info <mintAddress>');
    }
    
    const connection = await getConnection(network);
    const mintPubkey = new PublicKey(mint);
    
    try {
      const mintInfo = await getMint(connection, mintPubkey);
      const supply = Number(mintInfo.supply.toString()) / Math.pow(10, mintInfo.decimals);
      
      console.log(`\n📋 Token Info (${network})`);
      console.log(`   Mint: ${mint}`);
      console.log(`   Decimals: ${mintInfo.decimals}`);
      console.log(`   Supply: ${supply.toLocaleString()}`);
      console.log(`   Mint Authority: ${mintInfo.mintAuthority?.toBase58() || 'None'}`);
      console.log(`   Freeze Authority: ${mintInfo.freezeAuthority?.toBase58() || 'None'}\n`);
      
      return { supply, ...mintInfo };
    } catch (err) {
      throw new Error(`Failed to get token info: ${err.message}`);
    }
  }
};

async function main() {
  const cmd = process.argv[2];
  const rawArgs = process.argv.slice(3);
  const { opts, args } = parseArgs(rawArgs);
  
  if (!cmd || !commands[cmd]) {
    console.log(`
Solana Token Launcher CLI
Usage: node token-launcher.js <command> [options]

Commands:
  create <mintAuthority>    Create a new SPL token
  mint <mint> <receiver>    Mint tokens to a receiver
  info <mint>              Get token info

Options:
  --name <name>            Token name (e.g., "My Token")
  --symbol <symbol>        Token symbol (e.g., "MTK")
  --decimals <num>        Token decimals (default: 9)
  --supply <amount>       Initial supply to mint
  --devnet                Use devnet instead of mainnet

Examples:
  node token-launcher.js create <WALLET_ADDR> --name "My Token" --symbol "MTK" --decimals 9 --supply 1000000
  node token-launcher.js mint <MINT_ADDR> <RECEIVER_ADDR> --supply 500
  node token-launcher.js info <MINT_ADDR>
  node token-launcher.js info <MINT_ADDR> --devnet
`);
    process.exit(1);
  }
  
  try {
    await commands[cmd](args, opts);
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}\n`);
    process.exit(1);
  }
}

if (!fs.existsSync(path.join(__dirname, 'tokens'))) {
  fs.mkdirSync(path.join(__dirname, 'tokens'));
}

main();
