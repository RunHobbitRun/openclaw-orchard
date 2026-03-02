#!/usr/bin/env node
/**
 * Knowledge Bridge - Intelligence Broadcasting Tool
 * Connects RAG + Social Scrapers to broadcast daily context
 * Usage: node knowledge-bridge.js [command] [options]
 * 
 * Commands:
 *   daily                 Generate daily intelligence brief
 *   broadcast <msg>       Send message to all workspaces
 *   sync                  Sync all data sources
 */

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const WORKSPACE_ROOT = '/home/ubuntu/.openclaw/workspace';
const RAG_PATH = `${WORKSPACE_ROOT}/rag/rag.py`;
const X_SCRAPER_PATH = `${WORKSPACE_ROOT}/devteam/built_tools/scripts/x-scraper.mjs`;
const KNOWLEDGE_DIR = '/home/ubuntu/openclaw-knowledge';

// Output channels
const CHANNELS = {
  intelligence: `${WORKSPACE_ROOT}/intelligence`,
  factory: `${WORKSPACE_ROOT}/factory`,
  sniper: `${WORKSPACE_ROOT}/sniper`
};

function runCommand(cmd, timeout = 30000) {
  try {
    return execSync(cmd, { 
      encoding: 'utf8', 
      timeout,
      cwd: WORKSPACE_ROOT,
      shell: '/bin/bash'
    });
  } catch (e) {
    return `Error: ${e.message}`;
  }
}

function getRAGStats() {
  const result = runCommand(`source ${WORKSPACE_ROOT}/venv/bin/activate && python3 ${RAG_PATH} stats`);
  return result;
}

function searchKnowledge(query) {
  const result = runCommand(`source ${WORKSPACE_ROOT}/venv/bin/activate && python3 ${RAG_PATH} search "${query}" 2>/dev/null`);
  return result;
}

function getXSentiment(query) {
  const result = runCommand(`node ${X_SCRAPER_PATH} sentiment "${query}" 2>/dev/null`);
  return result;
}

function writeBroadcast(channel, message) {
  const broadcastFile = path.join(CHANNELS[channel], 'INBOX.md');
  const timestamp = new Date().toISOString();
  const content = `# Intelligence Broadcast\n**Time:** ${timestamp}\n\n${message}\n`;
  
  try {
    fs.writeFileSync(broadcastFile, content);
    return true;
  } catch (e) {
    console.error(`Failed to write to ${channel}: ${e.message}`);
    return false;
  }
}

const commands = {
  daily: async () => {
    console.log('\n📡 Generating Daily Intelligence Brief...\n');
    
    const brief = [];
    brief.push('## 📊 Daily Market Intelligence\n');
    brief.push(`**Generated:** ${new Date().toISOString()}\n`);
    
    // 1. RAG Knowledge Summary
    console.log('   📚 Checking knowledge base...');
    const ragStats = getRAGStats();
    brief.push('### Knowledge Base Status\n```\n' + ragStats + '\n```\n');
    
    // 2. X Sentiment for key terms
    console.log('   🐦 Analyzing X sentiment...');
    const btcSentiment = getXSentiment('bitcoin');
    const solSentiment = getXSentiment('solana');
    
    brief.push('### Social Sentiment\n');
    brief.push('#### Bitcoin\n```\n' + btcSentiment.slice(0, 500) + '\n```\n');
    brief.push('#### Solana\n```\n' + solSentiment.slice(0, 500) + '\n```\n');
    
    // 3. Trending topics from knowledge
    console.log('   🔍 Querying relevant topics...');
    const archInfo = searchKnowledge('OpenClaw architecture security');
    brief.push('### Architecture Context\n```\n' + archInfo.slice(0, 800) + '\n```\n');
    
    const fullBrief = brief.join('\n');
    
    console.log('\n📄 Generated Brief:\n');
    console.log(fullBrief);
    
    // Write to all workspaces
    console.log('\n📡 Broadcasting to workspaces...');
    for (const [name, path] of Object.entries(CHANNELS)) {
      if (fs.existsSync(path)) {
        const success = writeBroadcast(name, fullBrief);
        console.log(`   ${success ? '✅' : '❌'} ${name}`);
      } else {
        console.log(`   ⚠️  ${name} (not found)`);
      }
    }
    
    console.log('\n✅ Daily brief complete.\n');
    return fullBrief;
  },
  
  broadcast: async (args) => {
    const message = args.join(' ');
    if (!message) {
      throw new Error('Usage: knowledge-bridge.js broadcast <message>');
    }
    
    console.log('\n📡 Broadcasting message to all workspaces...\n');
    
    const timestamp = new Date().toISOString();
    const fullMessage = `**Broadcast @ ${timestamp}**\n\n${message}`;
    
    for (const [name, path] of Object.entries(CHANNELS)) {
      if (fs.existsSync(path)) {
        const success = writeBroadcast(name, fullMessage);
        console.log(`   ${success ? '✅' : '❌'} ${name}`);
      }
    }
    
    console.log('\n✅ Broadcast complete.\n');
  },
  
  sync: async () => {
    console.log('\n🔄 Syncing all data sources...\n');
    
    // 1. Ingest new documents into RAG
    console.log('   📚 Ingesting knowledge documents...');
    const ingestResult = runCommand(`source ${WORKSPACE_ROOT}/venv/bin/activate && python3 ${RAG_PATH} ingest ${KNOWLEDGE_DIR}/Deep-Research/ 2>/dev/null`, 60000);
    console.log('   ' + ingestResult.slice(0, 200));
    
    // 2. Check X token validity
    console.log('\n   🐦 Checking X token...');
    try {
      const tokenData = JSON.parse(fs.readFileSync('/home/ubuntu/.openclaw/workspace/.secrets/x_token.json', 'utf8'));
      console.log(`   Token expires: ${tokenData.expires || 'unknown'}`);
    } catch (e) {
      console.log('   ⚠️  Could not read X token');
    }
    
    // 3. Verify workspace directories
    console.log('\n   📁 Verifying workspaces...');
    for (const [name, path] of Object.entries(CHANNELS)) {
      const exists = fs.existsSync(path);
      console.log(`   ${exists ? '✅' : '❌'} ${name}`);
    }
    
    console.log('\n✅ Sync complete.\n');
  },
  
  status: async () => {
    console.log('\n📊 Knowledge Bridge Status\n');
    
    // RAG status
    console.log('📚 RAG System:');
    console.log(getRAGStats());
    
    // X Scraper
    console.log('\n🐦 X Scraper: Built');
    console.log('   Path: ' + X_SCRAPER_PATH);
    
    // Channels
    console.log('\n📡 Broadcast Channels:');
    for (const [name, path] of Object.entries(CHANNELS)) {
      const exists = fs.existsSync(path);
      const inboxExists = fs.existsSync(path + '/INBOX.md');
      console.log(`   ${exists ? '✅' : '❌'} ${name} ${inboxExists ? '(has inbox)' : ''}`);
    }
    
    console.log('');
  }
};

async function main() {
  const cmd = process.argv[2];
  const args = process.argv.slice(3);
  
  if (!cmd || !commands[cmd]) {
    console.log(`
Knowledge Bridge - Intelligence Broadcasting
Usage: node knowledge-bridge.js <command> [options]

Commands:
  daily                 Generate and broadcast daily brief
  broadcast <msg>       Send message to all workspaces
  sync                  Sync all data sources
  status                Show system status

Examples:
  node knowledge-bridge.js daily
  node knowledge-bridge.js broadcast "ALERT: High volatility expected"
  node knowledge-bridge.js sync
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