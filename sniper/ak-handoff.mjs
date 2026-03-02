#!/usr/bin/env node
/**
 * AK.pro Handoff Pipeline for Sniper Ops
 * Outputs target contract addresses for Max to execute manually via AK.pro
 * 
 * Commands:
 *   add <ca> [--narrative "..."] [--exit "...,...,..."]  - Add a target
 *   list                                                  - List all targets
 *   remove <ca>                                           - Remove a target
 *   clear                                                 - Clear all targets
 *   webhook <url>                                         - Set webhook URL
 *   push                                                  - Push targets to webhook
 * 
 * Output file: /home/ubuntu/.openclaw/workspace/sniper/TARGETS.json
 */

import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = '/home/ubuntu/.openclaw/workspace/sniper/TARGETS.json';

// Initialize targets file if it doesn't exist
function initTargetsFile() {
  if (!fs.existsSync(OUTPUT_FILE)) {
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify({
      targets: [],
      webhook: null,
      lastUpdated: null
    }, null, 2));
  }
}

// Read targets
function readTargets() {
  initTargetsFile();
  const content = fs.readFileSync(OUTPUT_FILE, 'utf-8');
  return JSON.parse(content);
}

// Write targets
function writeTargets(data) {
  data.lastUpdated = new Date().toISOString();
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(data, null, 2));
  return data;
}

// Add a target
function addTarget(ca, narrative = '', exitLadder = []) {
  const data = readTargets();
  
  // Check if target already exists
  const existingIndex = data.targets.findIndex(t => t.ca.toLowerCase() === ca.toLowerCase());
  if (existingIndex >= 0) {
    // Update existing
    data.targets[existingIndex] = {
      ...data.targets[existingIndex],
      narrative: narrative || data.targets[existingIndex].narrative,
      exit_ladder: exitLadder.length > 0 ? exitLadder : data.targets[existingIndex].exit_ladder
    };
    console.log(`📝 Updated existing target: ${ca}`);
  } else {
    // Add new
    data.targets.push({
      ca,
      narrative,
      exit_ladder: exitLadder,
      created: new Date().toISOString()
    });
    console.log(`✅ Added new target: ${ca}`);
  }
  
  writeTargets(data);
  return data;
}

// Remove a target
function removeTarget(ca) {
  const data = readTargets();
  const initialLength = data.targets.length;
  
  data.targets = data.targets.filter(t => t.ca.toLowerCase() !== ca.toLowerCase());
  
  if (data.targets.length === initialLength) {
    console.log(`⚠️  Target not found: ${ca}`);
    return data;
  }
  
  writeTargets(data);
  console.log(`🗑️  Removed target: ${ca}`);
  return data;
}

// List targets
function listTargets() {
  const data = readTargets();
  
  if (data.targets.length === 0) {
    console.log('📋 No targets in queue.\n');
    return data;
  }
  
  console.log(`\n📋 Target Queue (${data.targets.length} targets):\n`);
  console.log('─'.repeat(80));
  
  data.targets.forEach((target, index) => {
    console.log(`\n[${index + 1}] CA: ${target.ca}`);
    console.log(`    Narrative: ${target.narrative || '(none)'}`);
    console.log(`    Exit Ladder: ${target.exit_ladder.length > 0 ? target.exit_ladder.join(', ') : '(none)'}`);
    console.log(`    Created: ${target.created || 'N/A'}`);
  });
  
  console.log('\n' + '─'.repeat(80));
  console.log(`\nWebhook: ${data.webhook || '(not set)'}`);
  console.log(`Last Updated: ${data.lastUpdated || 'N/A'}\n`);
  
  return data;
}

// Set webhook
function setWebhook(url) {
  const data = readTargets();
  data.webhook = url;
  writeTargets(data);
  console.log(`🔗 Webhook set: ${url}`);
  return data;
}

// Push to webhook
async function pushToWebhook() {
  const data = readTargets();
  
  if (!data.webhook) {
    console.log('❌ No webhook configured. Use: webhook <url>');
    process.exit(1);
  }
  
  if (data.targets.length === 0) {
    console.log('⚠️  No targets to push.');
    return;
  }
  
  console.log(`🚀 Pushing ${data.targets.length} targets to webhook...`);
  
  try {
    const response = await fetch(data.webhook, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        source: 'sniper-ops',
        timestamp: new Date().toISOString(),
        targets: data.targets
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    console.log('✅ Successfully pushed targets to webhook.');
  } catch (error) {
    console.error(`❌ Webhook push failed: ${error.message}`);
    process.exit(1);
  }
}

// Clear all targets
function clearTargets() {
  const data = { targets: [], webhook: readTargets().webhook, lastUpdated: null };
  writeTargets(data);
  console.log('🗑️  All targets cleared.');
  return data;
}

// Parse exit ladder from string
function parseExitLadder(str) {
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(s => s.length > 0);
}

// Main CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
AK.pro Handoff Pipeline for Sniper Ops

Usage:
  node ak-handoff.mjs add <ca> [options]    Add a target
  node ak-handoff.mjs list                  List all targets
  node ak-handoff.mjs remove <ca>           Remove a target
  node ak-handoff.mjs clear                 Clear all targets
  node ak-handoff.mjs webhook <url>        Set webhook URL
  node ak-handoff.mjs push                  Push targets to webhook

Options for 'add':
  --narrative "..."     Narrative/description for the target
  --exit "...,...,..."  Exit ladder percentages (comma-separated)

Output: ${OUTPUT_FILE}
`);
    process.exit(0);
  }
  
  try {
    switch (command) {
      case 'add': {
        const ca = args[1];
        if (!ca || ca.startsWith('--')) {
          throw new Error('Usage: add <ca> [--narrative "..."] [--exit "...,..."]');
        }
        
        let narrative = '';
        let exitStr = '';
        
        for (let i = 2; i < args.length; i++) {
          if (args[i] === '--narrative' && args[i + 1]) {
            narrative = args[i + 1];
            i++;
          } else if (args[i] === '--exit' && args[i + 1]) {
            exitStr = args[i + 1];
            i++;
          }
        }
        
        const exitLadder = parseExitLadder(exitStr);
        addTarget(ca, narrative, exitLadder);
        listTargets();
        break;
      }
      
      case 'list':
        listTargets();
        break;
        
      case 'remove': {
        const ca = args[1];
        if (!ca) {
          throw new Error('Usage: remove <ca>');
        }
        removeTarget(ca);
        listTargets();
        break;
      }
      
      case 'clear':
        clearTargets();
        break;
        
      case 'webhook': {
        const url = args[1];
        if (!url) {
          throw new Error('Usage: webhook <url>');
        }
        setWebhook(url);
        break;
      }
      
      case 'push':
        await pushToWebhook();
        break;
        
      default:
        throw new Error(`Unknown command: ${command}`);
    }
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();