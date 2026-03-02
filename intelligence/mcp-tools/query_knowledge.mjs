#!/usr/bin/env node
/**
 * Query Knowledge Base - MCP Tool for Obsidian
 * Queries the knowledge base using obsidian-mcp
 * 
 * Usage:
 *   node query_knowledge.mjs search <query>    - Search for notes
 *   node query_knowledge.mjs read <path>       - Read a specific note
 *   node query_knowledge.mjs list [path]       - List notes in directory
 *   node query_knowledge.mjs recent [n]        - List N most recent notes
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const KNOWLEDGE_BASE = '/home/ubuntu/openclaw-knowledge';
const OBSIDIAN_MCP = '/home/ubuntu/.openclaw/workspace/mcps/obsidian-mcp/build/main.js';

// Call obsidian-mcp via stdio
async function callMcp(method, params = {}) {
  return new Promise((resolve, reject) => {
    const mcp = spawn('node', [OBSIDIAN_MCP], {
      env: { ...process.env, OBSIDIAN_VAULT_PATH: KNOWLEDGE_BASE }
    });
    
    let stdout = '';
    let stderr = '';
    
    mcp.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    mcp.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    mcp.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`MCP exited with code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });
    
    // Send MCP request
    const request = JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method,
      params
    });
    
    mcp.stdin.write(request + '\n');
    mcp.stdin.end();
  });
}

// Search notes using simple file grep (fallback)
async function searchNotesFallback(query) {
  const results = [];
  
  function searchDir(dir, baseDir = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(baseDir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        searchDir(fullPath, relativePath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (content.toLowerCase().includes(query.toLowerCase()) || 
            relativePath.toLowerCase().includes(query.toLowerCase())) {
          results.push({
            path: relativePath,
            preview: content.slice(0, 200) + '...'
          });
        }
      }
    }
  }
  
  searchDir(KNOWLEDGE_BASE);
  return results;
}

// List notes in directory
function listNotes(dirPath = '') {
  const fullPath = path.join(KNOWLEDGE_BASE, dirPath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ Directory not found: ${dirPath}`);
    return [];
  }
  
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  
  return entries
    .filter(e => e.isDirectory() || e.name.endsWith('.md'))
    .map(e => ({
      name: e.name,
      type: e.isDirectory() ? 'directory' : 'note',
      path: path.join(dirPath, e.name)
    }));
}

// Read a note
function readNote(notePath) {
  const fullPath = path.join(KNOWLEDGE_BASE, notePath);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  
  return fs.readFileSync(fullPath, 'utf-8');
}

// Get recent notes
function getRecentNotes(count = 10) {
  const notes = [];
  
  function scanDir(dir, baseDir = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.join(baseDir, entry.name);
      
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        scanDir(fullPath, relativePath);
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        const stat = fs.statSync(fullPath);
        notes.push({
          path: relativePath,
          modified: stat.mtime
        });
      }
    }
  }
  
  scanDir(KNOWLEDGE_BASE);
  
  return notes
    .sort((a, b) => b.modified - a.modified)
    .slice(0, count);
}

// Main CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
Query Knowledge Base - MCP Tool

Usage:
  node query_knowledge.mjs search <query>    Search for notes
  node query_knowledge.mjs read <path>       Read a specific note
  node query_knowledge.mjs list [path]      List notes in directory
  node query_knowledge.mjs recent [n]        List N most recent notes

Knowledge Base: ${KNOWLEDGE_BASE}
`);
    process.exit(0);
  }
  
  try {
    switch (command) {
      case 'search': {
        const query = args.slice(1).join(' ');
        if (!query) {
          throw new Error('Usage: search <query>');
        }
        
        console.log(`🔍 Searching for: "${query}"\n`);
        const results = await searchNotesFallback(query);
        
        if (results.length === 0) {
          console.log('No results found.');
        } else {
          console.log(`Found ${results.length} result(s):\n`);
          results.forEach((r, i) => {
            console.log(`[${i + 1}] ${r.path}`);
            console.log(`    ${r.preview.slice(0, 100)}...\n`);
          });
        }
        break;
      }
      
      case 'read': {
        const notePath = args[1];
        if (!notePath) {
          throw new Error('Usage: read <path>');
        }
        
        console.log(`📖 Reading: ${notePath}\n`);
        const content = readNote(notePath);
        
        if (!content) {
          console.log(`❌ Note not found: ${notePath}`);
        } else {
          console.log(content);
        }
        break;
      }
      
      case 'list': {
        const dirPath = args[1] || '';
        console.log(`📁 Listing: ${dirPath || '(root)'}\n`);
        
        const items = listNotes(dirPath);
        
        items.forEach(item => {
          const icon = item.type === 'directory' ? '📂' : '📝';
          console.log(`${icon} ${item.name}`);
        });
        
        console.log(`\n${items.length} item(s)`);
        break;
      }
      
      case 'recent': {
        const count = parseInt(args[1]) || 10;
        console.log(`🕐 ${count} Most Recent Notes:\n`);
        
        const notes = getRecentNotes(count);
        
        notes.forEach((n, i) => {
          const date = n.modified.toISOString().split('T')[0];
          console.log(`[${i + 1}] ${n.path}`);
          console.log(`    Modified: ${date}\n`);
        });
        break;
      }
      
      default:
        throw new Error(`Unknown command: ${command}`);
    }
    
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
    process.exit(1);
  }
}

main();