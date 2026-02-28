#!/usr/bin/env node
/**
 * Sniper Sleuth Toolkit - On-chain Analysis Tools
 * Usage: node sleuth.js [command] [options]
 * 
 * Commands:
 *   bundle-analyzer <token>    Find earliest buyers (block 0-5)
 *   bank-tracer <wallet>       Trace SOL funding to source bank
 *   dev-profiler <wallet>      Find tokens created by developer
 * 
 * Options:
 *   --network <mainnet|devnet>  Network to use (default: mainnet)
 */

const { Connection, PublicKey } = require('@solana/web3.js');
const axios = require('axios');

// Config
const HELIUS_API_KEY = process.env.HELIUS_API_KEY || '9fa275a8-0721-4e99-9b85-b76bfdb2a0c3';

const MAINNET_RPC = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`;
const DEVNET_RPC = 'https://api.devnet.solana.com';

const TOKEN_PROGRAM = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const SYSTEM_PROGRAM = new PublicKey('11111111111111111111111111111111');

function getConnection(network = 'mainnet') {
  return new Connection(network === 'devnet' ? DEVNET_RPC : MAINNET_RPC, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0
  });
}

async function heliusRequest(method, params) {
  const response = await axios.post(
    MAINNET_RPC,
    {
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    },
    { headers: { 'Content-Type': 'application/json' }, timeout: 30000 }
  );
  return response.data.result;
}

// Commands
const commands = {
  // Find earliest buyers (block 0-5)
  'bundle-analyzer': async (args) => {
    const mint = args[0];
    if (!mint) {
      throw new Error('Usage: sleuth.js bundle-analyzer <token_mint>');
    }
    
    console.log(`\n🔍 Analyzing bundle for: ${mint}\n`);
    const connection = getConnection();
    
    try {
      // Get signatures for the mint address
      const signatures = await heliusRequest('getSignaturesForAddress', [
        mint,
        { limit: 100 }
      ]);
      
      if (!signatures || signatures.length === 0) {
        console.log('No transactions found for this token');
        return { error: 'No transactions found' };
      }
      
      // Get the earliest slot
      const earliestSlot = signatures[0].slot;
      const cutoffSlot = earliestSlot + 5; // Block 0-5
      
      console.log(`   Token created at slot: ${earliestSlot}`);
      console.log(`   Analyzing slots ${earliestSlot} to ${cutoffSlot}\n`);
      
      // Get transaction details for early transactions
      const buyers = [];
      const seen = new Set();
      
      for (const sig of signatures) {
        if (sig.slot > cutoffSlot) break;
        
        try {
          const tx = await heliusRequest('getTransaction', [
            sig.signature,
            { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }
          ]);
          
          if (!tx || !tx.meta) continue;
          
          // Parse token transfers from the transaction
          const tokenTransfers = tx.meta.tokenTransfers || [];
          
          for (const transfer of tokenTransfers) {
            if (transfer.mint === mint && parseFloat(transfer.tokenAmount) > 0) {
              const buyer = transfer.destination;
              
              if (!seen.has(buyer)) {
                seen.add(buyer);
                buyers.push({
                  wallet: buyer,
                  slot: sig.slot,
                  timestamp: sig.blockTime,
                  amount: transfer.tokenAmount,
                  signature: sig.signature.slice(0, 16) + '...',
                  err: sig.err
                });
              }
            }
          }
          
          // Also check inner token transfers
          const innerTokenTransfers = tx.meta.innerInstructions?.flatMap(
            i => i.instructions.flatMap(inst => inst.parsed || {})
          ).filter(p => p.type === 'transfer') || [];
          
        } catch (e) {
          // Skip failed tx parses
          continue;
        }
      }
      
      // Sort by slot
      buyers.sort((a, b) => a.slot - b.slot);
      
      console.log(`📦 Found ${buyers.length} unique early buyers (block 0-5):\n`);
      
      for (let i = 0; i < buyers.length; i++) {
        const b = buyers[i];
        const time = b.timestamp ? new Date(b.timestamp * 1000).toISOString() : 'N/A';
        console.log(`  ${i + 1}. ${b.wallet.slice(0, 8)}...${b.wallet.slice(-4)}`);
        console.log(`     Slot: ${b.slot} | Amount: ${b.amount} | ${time}`);
        console.log(`     TX: ${b.signature}${b.err ? ' ⚠️' : ''}\n`);
      }
      
      console.log(`✅ Bundle analysis complete. ${buyers.length} snipers identified.\n`);
      
      return { mint, buyers };
    } catch (err) {
      throw new Error(`Bundle analysis failed: ${err.message}`);
    }
  },
  
  // Trace SOL funding to source bank
  'bank-tracer': async (args) => {
    const wallet = args[0];
    if (!wallet) {
      throw new Error('Usage: sleuth.js bank-tracer <wallet_address>');
    }
    
    console.log(`\n🏦 Tracing SOL source for: ${wallet}\n`);
    const connection = getConnection();
    
    try {
      // Get all signatures for this wallet
      const signatures = await heliusRequest('getSignaturesForAddress', [
        wallet,
        { limit: 100 }
      ]);
      
      if (!signatures || signatures.length === 0) {
        console.log('No transaction history found for this wallet');
        return { error: 'No transactions' };
      }
      
      console.log(`   Found ${signatures.length} transactions to analyze\n`);
      
      // Track SOL sources
      const sources = new Map();
      let firstTxSlot = signatures[0]?.slot;
      
      // Check early transactions for funding sources
      for (const sig of signatures.slice(0, 30)) {
        const tx = await heliusRequest('getTransaction', [
          sig.signature,
          { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }
        ]);
        
        if (!tx || !tx.meta || !tx.transaction) continue;
        
        const accountKeys = tx.transaction.message.accountKeys || [];
        const preBalances = tx.meta.preBalances || [];
        const postBalances = tx.meta.postBalances || [];
        
        // Find accounts that sent SOL to our target wallet
        for (let i = 0; i < accountKeys.length; i++) {
          const account = accountKeys[i];
          const pubkey = account.pubkey || account;
          const pre = preBalances[i] || 0;
          const post = postBalances[i] || 0;
          
          // If this account decreased balance AND our target increased
          // This account is a source of funds
          const targetIdx = accountKeys.findIndex(
            a => (a.pubkey || a) === wallet
          );
          
          if (targetIdx >= 0) {
            const targetPre = preBalances[targetIdx] || 0;
            const targetPost = postBalances[targetIdx] || 0;
            
            // This is an incoming transfer to target
            if (targetPost > targetPre && pubkey !== wallet && post < pre) {
              const delta = pre - post;
              if (delta > 1000000) { // More than 0.001 SOL
                const existing = sources.get(pubkey) || 0;
                sources.set(pubkey, existing + delta);
              }
            }
          }
        }
      }
      
      // Get top sources
      const sortedSources = Array.from(sources.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([addr, lamports]) => ({
          wallet: addr,
          totalSent: lamports / 1e9,
          lamports
        }));
      
      console.log(`💰 Potential funding sources:\n`);
      
      if (sortedSources.length === 0) {
        console.log('  No clear funding source found. Wallet may be:\n');
        console.log('  - A token contract (ATA)');
        console.log('  - Funded via token mint');
        console.log('  - Newly created (no incoming txs yet)\n');
      } else {
        for (const src of sortedSources) {
          console.log(`  ${src.wallet.slice(0, 8)}...${src.wallet.slice(-4)}`);
          console.log(`     Total sent: ${src.totalSent.toFixed(4)} SOL\n`);
        }
        
        const bank = sortedSources[0];
        console.log(`🏦 IDENTIFIED BANK: ${bank.wallet}`);
        console.log(`   Total funded: ${bank.totalSent.toFixed(4)} SOL\n`);
      }
      
      return { wallet, sources: sortedSources };
    } catch (err) {
      throw new Error(`Bank tracing failed: ${err.message}`);
    }
  },
  
  // Find tokens created by developer
  'dev-profiler': async (args) => {
    const wallet = args[0];
    if (!wallet) {
      throw new Error('Usage: sleuth.js dev-profiler <wallet_address>');
    }
    
    console.log(`\n👤 Profiling developer: ${wallet}\n`);
    const connection = getConnection();
    
    try {
      // Get all token accounts owned by this wallet
      const accounts = await heliusRequest('getTokenAccountsByOwner', [
        wallet,
        { programId: TOKEN_PROGRAM.toBase58() },
        { encoding: 'jsonParsed' }
      ]);
      
      const tokenAccounts = accounts?.value || [];
      console.log(`   Found ${tokenAccounts.length} token accounts\n`);
      
      // Get info for each token
      const tokens = [];
      
      for (const account of tokenAccounts) {
        const data = account.account.data.parsed.info;
        const mint = data.mint;
        const balance = data.tokenAmount.amount;
        const decimals = data.tokenAmount.decimals;
        
        // Get creation info for this mint
        let firstTx = null;
        try {
          const sigs = await heliusRequest('getSignaturesForAddress', [
            mint,
            { limit: 1 }
          ]);
          firstTx = sigs?.[0];
        } catch (e) {
          // Skip if can't get
        }
        
        tokens.push({
          mint,
          balance: balance / Math.pow(10, decimals),
          decimals,
          hasBalance: data.tokenAmount.uiAmountString !== '0',
          created: firstTx?.blockTime ? new Date(firstTx.blockTime * 1000).toISOString() : null,
          firstSignature: firstTx?.signature?.slice(0, 16) + '...'
        });
      }
      
      // Sort by creation date
      tokens.sort((a, b) => {
        if (!a.created) return 1;
        if (!b.created) return -1;
        return new Date(a.created) - new Date(b.created);
      });
      
      console.log(`📋 Found ${tokens.length} tokens:\n`);
      
      for (const token of tokens) {
        const status = token.hasBalance ? '💎' : '○';
        console.log(`  ${status} ${token.mint.slice(0, 8)}...${token.mint.slice(-4)}`);
        console.log(`     Balance: ${token.balance.toFixed(4)} | Decimals: ${token.decimals}`);
        if (token.created) {
          console.log(`     Created: ${token.created}`);
          console.log(`     First TX: ${token.firstSignature}`);
        }
        console.log('');
      }
      
      // Summary
      const withBalance = tokens.filter(t => t.hasBalance).length;
      console.log(`📊 Summary: ${tokens.length} total tokens, ${withBalance} with balance\n`);
      
      return { wallet, tokens };
    } catch (err) {
      throw new Error(`Dev profiling failed: ${err.message}`);
    }
  }
};

async function main() {
  const cmd = process.argv[2];
  const args = process.argv.slice(3).filter(a => !a.startsWith('--'));
  
  if (!cmd || !commands[cmd]) {
    console.log(`
Sniper Sleuth Toolkit - On-chain Analysis
Usage: node sleuth.js <command> [options]

Commands:
  bundle-analyzer <token>    Find earliest buyers (block 0-5)
  bank-tracer <wallet>       Trace SOL funding to source bank  
  dev-profiler <wallet>     Find tokens created by developer

Examples:
  node sleuth.js bundle-analyzer <TOKEN_MINT>
  node sleuth.js bank-tracer <WALLET_ADDRESS>
  node sleuth.js dev-profiler <WALLET_ADDRESS>
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
