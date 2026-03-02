#!/usr/bin/env node
/**
 * Deep Research - MCP Tool for NotebookLM
 * Triggers deep research using notebook-mcp
 * 
 * Usage:
 *   node deep_research.mjs create <topic>              Create a new research topic
 *   node deep_research.mjs status <notebookId>         Check research status
 *   node deep_research.mjs export <notebookId>         Export research results
 *   node deep_research.mjs list                        List all research notebooks
 *   node deep_research.mjs source <file>              Add source to knowledge base
 * 
 * The NotebookLM MCP enables AI-powered deep research on topics.
 */

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const KNOWLEDGE_BASE = '/home/ubuntu/openclaw-knowledge';
const DEEP_RESEARCH_DIR = path.join(KNOWLEDGE_BASE, 'Deep-Research');
const NOTEBOOK_MCP = '/home/ubuntu/.openclaw/workspace/mcps/notebook-mcp/build/index.js';

// Ensure Deep-Research directory exists
function ensureResearchDir() {
  if (!fs.existsSync(DEEP_RESEARCH_DIR)) {
    fs.mkdirSync(DEEP_RESEARCH_DIR, { recursive: true });
  }
}

// Create a research topic (creates markdown note)
function createResearchTopic(topic) {
  ensureResearchDir();
  
  const slug = topic.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  
  const timestamp = new Date().toISOString();
  const date = timestamp.split('T')[0];
  
  const notePath = path.join(DEEP_RESEARCH_DIR, `${slug}.md`);
  
  const frontmatter = `---
title: "${topic}"
created: "${timestamp}"
status: "researching"
source: "deep-research-mcp"
---

# ${topic}

## Research Summary

*Auto-generated research pending...*

## Key Findings

- *To be populated*

## Sources

- *To be populated*

## Related Topics

- *To be populated*

---
*Created by deep_research.mjs on ${date}*
`;
  
  if (fs.existsSync(notePath)) {
    console.log(`⚠️  Research topic already exists: ${notePath}`);
    return { path: notePath, status: 'existing' };
  }
  
  fs.writeFileSync(notePath, frontmatter);
  console.log(`✅ Created research topic: ${topic}`);
  console.log(`   Path: ${notePath}`);
  
  return {
    path: notePath,
    slug,
    topic,
    status: 'created'
  };
}

// List research topics
function listResearchTopics() {
  ensureResearchDir();
  
  const entries = fs.readdirSync(DEEP_RESEARCH_DIR, { withFileTypes: true });
  const topics = entries
    .filter(e => e.isFile() && e.name.endsWith('.md'))
    .map(e => {
      const fullPath = path.join(DEEP_RESEARCH_DIR, e.name);
      const stat = fs.statSync(fullPath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      
      // Extract title from frontmatter
      const titleMatch = content.match(/title:\s*"([^"]+)"/);
      const title = titleMatch ? titleMatch[1] : e.name.replace('.md', '');
      
      // Extract status
      const statusMatch = content.match(/status:\s*"([^"]+)"/);
      const status = statusMatch ? statusMatch[1] : 'unknown';
      
      return {
        name: e.name,
        title,
        status,
        created: stat.birthtime,
        modified: stat.mtime
      };
    });
  
  return topics;
}

// Export research to summary
function exportResearch(noteName) {
  ensureResearchDir();
  
  const notePath = path.join(DEEP_RESEARCH_DIR, noteName);
  
  if (!fs.existsSync(notePath)) {
    console.log(`❌ Research not found: ${noteName}`);
    return null;
  }
  
  const content = fs.readFileSync(notePath, 'utf-8');
  
  // Update status
  const updated = content.replace(
    /status:\s*"[^"]+"/,
    'status: "exported"'
  );
  
  fs.writeFileSync(notePath, updated);
  
  console.log(`📤 Exported research: ${noteName}`);
  return content;
}

// Add source to knowledge base
function addSource(filePath, category = 'general') {
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    return null;
  }
  
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  
  // Create source note in Deep-Research
  ensureResearchDir();
  
  const sourcePath = path.join(DEEP_RESEARCH_DIR, `source-${fileName}`);
  
  const frontmatter = `---
type: "source"
category: "${category}"
added: "${new Date().toISOString()}"
original_file: "${filePath}"
---

${content}
`;
  
  fs.writeFileSync(sourcePath, frontmatter);
  console.log(`📚 Added source: ${fileName}`);
  console.log(`   Category: ${category}`);
  console.log(`   Path: ${sourcePath}`);
  
  return sourcePath;
}

// Main CLI
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  if (!command) {
    console.log(`
Deep Research - MCP Tool for NotebookLM

Usage:
  node deep_research.mjs create <topic>       Create a new research topic
  node deep_research.mjs list                 List all research topics
  node deep_research.mjs export <noteName>   Export research results
  node deep_research.mjs source <file> [cat] Add source to knowledge base

Knowledge Base: ${KNOWLEDGE_BASE}
Research Dir: ${DEEP_RESEARCH_DIR}

Note: This tool creates structured markdown notes for deep research.
Future versions will integrate with NotebookLM MCP for AI-powered analysis.
`);
    process.exit(0);
  }
  
  try {
    switch (command) {
      case 'create': {
        const topic = args.slice(1).join(' ');
        if (!topic) {
          throw new Error('Usage: create <topic>');
        }
        createResearchTopic(topic);
        break;
      }
      
      case 'list': {
        console.log(`📋 Research Topics:\n`);
        const topics = listResearchTopics();
        
        if (topics.length === 0) {
          console.log('No research topics found.');
          console.log('Use "create <topic>" to start a new research.');
        } else {
          topics.forEach((t, i) => {
            const date = t.modified.toISOString().split('T')[0];
            console.log(`[${i + 1}] ${t.title}`);
            console.log(`    Status: ${t.status}`);
            console.log(`    Modified: ${date}\n`);
          });
        }
        break;
      }
      
      case 'export': {
        const noteName = args[1];
        if (!noteName) {
          throw new Error('Usage: export <noteName>');
        }
        exportResearch(noteName);
        break;
      }
      
      case 'source': {
        const filePath = args[1];
        const category = args[2] || 'general';
        
        if (!filePath) {
          throw new Error('Usage: source <file> [category]');
        }
        addSource(filePath, category);
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