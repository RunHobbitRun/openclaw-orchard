#!/usr/bin/env node
/**
 * Supabase Query CLI for Auditor Agent
 * READ-ONLY query tool with hardcoded table whitelist
 * 
 * Security: SELECT queries only, no user SQL input
 */

import { createClient } from '@supabase/supabase-js';

// Hardcoded table whitelist - only these tables can be queried
const ALLOWED_TABLES = new Set(['agent_actions', 'portfolio_state', 'trade_ledger']);

// Get credentials from environment
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error(JSON.stringify({
    error: 'Missing credentials',
    message: 'SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables required',
    timestamp: new Date().toISOString()
  }, null, 2));
  process.exit(1);
}

// Initialize Supabase client with service role (read-only in our queries)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Check database connection
 */
async function checkStatus() {
  const startTime = Date.now();
  
  try {
    // Simple query to test connection
    const { data, error } = await supabase
      .from('agent_actions')
      .select('id')
      .limit(1);
    
    const latencyMs = Date.now() - startTime;
    
    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows found, still means connection works
      return {
        status: 'error',
        connected: false,
        error: error.message,
        latency_ms: latencyMs,
        timestamp: new Date().toISOString()
      };
    }
    
    return {
      status: 'ok',
      connected: true,
      latency_ms: latencyMs,
      timestamp: new Date().toISOString(),
      summary: `Database connection successful (${latencyMs}ms)`
    };
  } catch (err) {
    return {
      status: 'error',
      connected: false,
      error: err.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * List all whitelisted tables with row counts
 */
async function listTables() {
  const results = [];
  
  for (const table of ALLOWED_TABLES) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        results.push({
          table,
          status: 'error',
          error: error.message,
          row_count: null
        });
      } else {
        results.push({
          table,
          status: 'ok',
          row_count: count
        });
      }
    } catch (err) {
      results.push({
        table,
        status: 'error',
        error: err.message,
        row_count: null
      });
    }
  }
  
  // Build summary
  const successCount = results.filter(r => r.status === 'ok').length;
  const totalRows = results.reduce((sum, r) => sum + (r.row_count || 0), 0);
  
  return {
    status: 'ok',
    tables: results,
    timestamp: new Date().toISOString(),
    summary: `${successCount}/${ALLOWED_TABLES.size} tables accessible, ${totalRows} total rows`
  };
}

/**
 * Try to query with different timestamp columns (schemas may vary)
 */
async function queryWithTimestamp(table, timestampCols = ['timestamp', 'created_at', 'updated_at', 'time']) {
  for (const col of timestampCols) {
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order(col, { ascending: false })
      .limit(1);
    
    if (!error) {
      return { data, timestampCol: col };
    }
    // If error is not about missing column, return the error
    if (!error.message.includes('does not exist')) {
      return { error: error.message };
    }
  }
  
  // Fall back to no ordering
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .limit(1);
  
  return { data, error: error?.message, timestampCol: null };
}

/**
 * Get latest portfolio snapshot
 */
async function getPortfolio() {
  try {
    const result = await queryWithTimestamp('portfolio_state');
    
    if (result.error) {
      return {
        status: 'error',
        error: result.error,
        timestamp: new Date().toISOString()
      };
    }
    
    const data = result.data?.[0] || null;
    
    if (!data) {
      return {
        status: 'ok',
        data: null,
        timestamp: new Date().toISOString(),
        summary: 'No portfolio state records found'
      };
    }
    
    const timestampVal = data.timestamp || data.created_at || data.updated_at || 'unknown';
    
    return {
      status: 'ok',
      data,
      timestamp: new Date().toISOString(),
      summary: `Latest snapshot: ${timestampVal}, ${Object.keys(data).length} fields`
    };
  } catch (err) {
    return {
      status: 'error',
      error: err.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get recent agent_actions (last 24 hours)
 */
async function getActions() {
  try {
    // Try different timestamp columns
    const timestampCols = ['created_at', 'timestamp', 'updated_at', 'time'];
    let data = null;
    let count = null;
    let usedCol = null;
    
    for (const col of timestampCols) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const result = await supabase
        .from('agent_actions')
        .select('*', { count: 'exact' })
        .gte(col, yesterday)
        .order(col, { ascending: false })
        .limit(100);
      
      if (!result.error) {
        data = result.data;
        count = result.count;
        usedCol = col;
        break;
      }
      
      // If error is not about missing column, stop trying
      if (!result.error.message.includes('does not exist')) {
        return {
          status: 'error',
          error: result.error.message,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Fallback: get recent without time filter
    if (data === null) {
      const result = await supabase
        .from('agent_actions')
        .select('*', { count: 'exact' })
        .order('id', { ascending: false })
        .limit(100);
      
      if (result.error) {
        return {
          status: 'error',
          error: result.error.message,
          timestamp: new Date().toISOString()
        };
      }
      
      data = result.data;
      count = result.count;
    }
    
    return {
      status: 'ok',
      count: count,
      data: data,
      timestamp: new Date().toISOString(),
      summary: `${count || 0} actions ${usedCol ? 'in last 24 hours' : '(no time filter available)'}`
    };
  } catch (err) {
    return {
      status: 'error',
      error: err.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Get recent trade_ledger entries
 */
async function getTrades() {
  try {
    // Try different timestamp columns
    const timestampCols = ['created_at', 'timestamp', 'trade_time', 'time', 'executed_at'];
    let data = null;
    let count = null;
    let usedCol = null;
    
    for (const col of timestampCols) {
      const result = await supabase
        .from('trade_ledger')
        .select('*', { count: 'exact' })
        .order(col, { ascending: false })
        .limit(50);
      
      if (!result.error) {
        data = result.data;
        count = result.count;
        usedCol = col;
        break;
      }
      
      // If error is not about missing column, stop trying
      if (!result.error.message.includes('does not exist')) {
        return {
          status: 'error',
          error: result.error.message,
          timestamp: new Date().toISOString()
        };
      }
    }
    
    // Fallback: get without ordering
    if (data === null) {
      const result = await supabase
        .from('trade_ledger')
        .select('*', { count: 'exact' })
        .limit(50);
      
      if (result.error) {
        return {
          status: 'error',
          error: result.error.message,
          timestamp: new Date().toISOString()
        };
      }
      
      data = result.data;
      count = result.count;
    }
    
    // Calculate summary stats if data exists
    let summary = `${count || 0} trade entries`;
    if (data && data.length > 0) {
      const latest = data[0];
      const latestTime = latest.created_at || latest.timestamp || latest.trade_time || 'unknown';
      summary += ` (latest: ${latestTime})`;
    }
    
    return {
      status: 'ok',
      count: count,
      data: data,
      timestamp: new Date().toISOString(),
      summary
    };
  } catch (err) {
    return {
      status: 'error',
      error: err.message,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const command = process.argv[2];
  
  if (!command) {
    console.error(JSON.stringify({
      error: 'No command provided',
      usage: 'node supabase-query.mjs <status|tables|portfolio|actions|trades>',
      timestamp: new Date().toISOString()
    }, null, 2));
    process.exit(1);
  }
  
  let result;
  
  switch (command) {
    case 'status':
      result = await checkStatus();
      break;
    case 'tables':
      result = await listTables();
      break;
    case 'portfolio':
      result = await getPortfolio();
      break;
    case 'actions':
      result = await getActions();
      break;
    case 'trades':
      result = await getTrades();
      break;
    default:
      result = {
        status: 'error',
        error: `Unknown command: ${command}`,
        valid_commands: ['status', 'tables', 'portfolio', 'actions', 'trades'],
        timestamp: new Date().toISOString()
      };
  }
  
  console.log(JSON.stringify(result, null, 2));
  
  // Exit with error code if status is error
  if (result.status === 'error') {
    process.exit(1);
  }
}

main().catch(err => {
  console.error(JSON.stringify({
    status: 'error',
    error: err.message,
    timestamp: new Date().toISOString()
  }, null, 2));
  process.exit(1);
});