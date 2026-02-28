#!/usr/bin/env node
/**
 * Sniper Data Monitor CLI - Token Data for Alpha Signals
 * Usage: node sniper-monitor.js [command] [options]
 * 
 * Commands:
 *   trending              Get latest token launches (DexScreener)
 *   info <address>       Get token price/liquidity data
 *   top                  Get top tokens by volume
 *   search <query>        Search tokens by symbol
 */

const axios = require('axios');

const DEX_API = 'https://api.dexscreener.com';
const BIRDEYE_API = 'https://public-api.birdeye.com/public/v1';

async function fetchDexScreener(url) {
  try {
    const res = await axios.get(url, { timeout: 10000, headers: { 'Accept': 'application/json' } });
    return res.data;
  } catch (err) {
    if (err.response?.status === 403 || err.response?.status === 404) {
      throw new Error('API rate limited or endpoint not available');
    }
    throw new Error(err.message);
  }
}

function formatNumber(num) {
  if (!num) return '$0';
  if (num >= 1e9) return '$' + (num / 1e9).toFixed(2) + 'B';
  if (num >= 1e6) return '$' + (num / 1e6).toFixed(2) + 'M';
  if (num >= 1e3) return '$' + (num / 1e3).toFixed(2) + 'K';
  return '$' + num.toFixed(2);
}

const commands = {
  // Get latest token launches from DexScreener
  trending: async () => {
    try {
      const data = await fetchDexScreener(`${DEX_API}/token-profiles/latest/v1?chainId=solana`);
      
      console.log('\n🔥 Latest Token Launches (DexScreener)\n');
      console.log('Token'.padEnd(30) + 'Address'.padEnd(12));
      console.log('='.repeat(50));
      
      for (const t of data.slice(0, 15)) {
        const name = (t.description?.split?.('\n')[0] || t.tokenAddress || 'Unknown').slice(0, 28);
        const addr = t.tokenAddress?.slice(0, 10) + '...' || '';
        console.log(name.padEnd(30) + addr);
        if (t.links?.[0]?.url) {
          console.log(`   → ${t.links[0].url.slice(0, 50)}`);
        }
      }
      console.log('');
      return data;
    } catch (err) {
      throw new Error(`Failed to get trending: ${err.message}`);
    }
  },
  
  // Get token info from DexScreener
  info: async (args) => {
    const address = args[0];
    if (!address) throw new Error('Usage: info <token_address>');
    
    // Try multiple DexScreener endpoints
    const endpoints = [
      `${DEX_API}/token/${address}`,
      `${DEX_API}/token-profiles/latest/v1?chainId=solana`
    ];
    
    let errorMsg = 'No data found';
    
    for (const url of endpoints) {
      try {
        const data = await fetchDexScreener(url);
        
        if (url.includes('/token/') && data?.pair) {
          const p = data.pair;
          console.log('\n📊 Token Info (DexScreener)\n');
          console.log(`   Token: ${p.baseToken?.name || 'Unknown'} (${p.baseToken?.symbol || '???'})`);
          console.log(`   Address: ${p.baseToken?.address || address}`);
          console.log(`   DEX: ${p.dexId || 'Unknown'}`);
          console.log(`   Price: $${parseFloat(p.priceUsd || 0).toFixed(6)}`);
          console.log(`   Liquidity: ${formatNumber(p.liquidity?.usd)}`);
          console.log(`   FDV: ${formatNumber(p.fdv)}`);
          console.log(`   Volume 24h: ${formatNumber(p.volume?.h24)}`);
          console.log(`   Pair: ${p.pairAddress?.slice(0, 12)}...\n`);
          return p;
        }
        
        // Search in token profiles
        if (Array.isArray(data)) {
          const match = data.find(t => t.tokenAddress?.toLowerCase() === address.toLowerCase());
          if (match) {
            console.log('\n📊 Token Info\n');
            console.log(`   Address: ${match.tokenAddress}`);
            console.log(`   Chain: ${match.chainId}`);
            if (match.description) console.log(`   Description: ${match.description.slice(0, 100)}`);
            console.log(`   URL: ${match.url}\n`);
            return match;
          }
        }
      } catch (e) {
        errorMsg = e.message;
      }
    }
    throw new Error(`No data found for ${address} (${errorMsg})`);
  },
  
  // Get top tokens by volume
  top: async () => {
    try {
      const data = await fetchDexScreener(`${DEX_API}/token-boosts/top/v1`);
      
      console.log('\n🏆 Top Boosted Tokens (DexScreener)\n');
      console.log('Token'.padEnd(24) + 'Price'.padEnd(14) + 'Chain');
      console.log('='.repeat(45));
      
      for (const t of data.slice(0, 15)) {
        console.log(t.tokenAddress?.slice(0, 22).padEnd(24) + 
          (t.priceUsd ? '$' + parseFloat(t.priceUsd).toFixed(4) : '$0').padEnd(14) +
          (t.chainId || 'solana'));
      }
      console.log('');
      return data;
    } catch (err) {
      throw new Error(`Failed to get top: ${err.message}`);
    }
  },
  
  // Search tokens
  search: async (args) => {
    const query = args.join(' ').toLowerCase();
    if (!query) throw new Error('Usage: search <query>');
    
    try {
      // Get all recent tokens and filter
      const data = await fetchDexScreener(`${DEX_API}/token-profiles/latest/v1?chainId=solana`);
      
      const results = data.filter(t => {
        const text = JSON.stringify(t).toLowerCase();
        return text.includes(query);
      }).slice(0, 10);
      
      console.log(`\n🔍 Search Results for "${query}"\n`);
      
      if (results.length === 0) {
        console.log('No results found.\n');
        return [];
      }
      
      for (const t of results) {
        console.log(`   ${t.tokenAddress?.slice(0, 12)}...`);
        console.log(`   ${t.url}\n`);
      }
      return results;
    } catch (err) {
      throw new Error(`Search failed: ${err.message}`);
    }
  },
  
  // Get pair data for a token
  pair: async (args) => {
    const token = args[0];
    if (!token) throw new Error('Usage: pair <token_address>');
    
    try {
      // Search through recent profiles
      const data = await fetchDexScreener(`${DEX_API}/token-profiles/latest/v1?chainId=solana`);
      const match = data.find(t => t.tokenAddress?.toLowerCase() === token.toLowerCase());
      
      if (match) {
        console.log('\n📈 Token Found\n');
        console.log(`   Address: ${match.tokenAddress}`);
        console.log(`   URL: ${match.url}\n`);
        return match;
      }
      throw new Error('Token not found');
    } catch (err) {
      throw new Error(`Failed to get pair: ${err.message}`);
    }
  }
};

async function main() {
  const cmd = process.argv[2];
  const args = process.argv.slice(3);
  
  if (!cmd || !commands[cmd]) {
    console.log(`
Sniper Data Monitor CLI - Alpha Signal Data
Usage: node sniper-monitor.js <command> [options]

Commands:
  trending              Get latest token launches (DexScreener)
  info <address>        Get token info by address
  top                   Get top boosted tokens
  search <query>        Search tokens by keyword
  pair <token>          Get pair data for token

Examples:
  node sniper-monitor.js trending
  node sniper-monitor.js info EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
  node sniper-monitor.js top
  node sniper-monitor.js search pepe
  node sniper-monitor.js pair <TOKEN>
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
