#!/usr/bin/env node
/**
 * Supabase Schema Deploy Script - Force IPv4
 */

const { Pool } = require('pg');
const dns = require('dns').promises;

// Supabase project region info
const PROJECT_HOST = 'db.mpscpjxbasugtaxkxqkw.supabase.co';

async function resolveIPv4() {
  try {
    const addresses = await dns.resolve4(PROJECT_HOST.replace('db.', ''));
    return addresses[0];
  } catch (e) {
    return null;
  }
}

async function deploy() {
  console.log('🔌 Connecting to Supabase (IPv4)...');
  
  // Try resolving IPv4
  const ipv4 = await resolveIPv4();
  if (ipv4) {
    console.log(`   Resolved to: ${ipv4}`);
  }
  
  const config = {
    user: 'postgres',
    host: ipv4 || PROJECT_HOST,
    database: 'postgres',
    password: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc2NwanhiYXN1Z3RheGt4cWt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg1ODM0NCwiZXhwIjoyMDg3NDM0MzQ0fQ.wV-A6Nqxpbp8C3y6wNYz-ozo3v6IZ2V7bAUkLV6ELRM',
    port: 5432,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 20000
  };
  
  console.log('   Host: ' + config.host);
  
  const pool = new Pool(config);
  
  try {
    const client = await pool.connect();
    console.log('✅ Connected!');
    
    const schemaSQL = `
CREATE TABLE IF NOT EXISTS trade_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc TIMESTAMPTZ DEFAULT NOW(),
  agent_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  stream TEXT NOT NULL,
  strategy TEXT,
  wallet_id TEXT,
  payload JSONB,
  confidence_score DECIMAL(3,2),
  outcome_pnl DECIMAL(12,4),
  cost_per_point DECIMAL(12,6),
  points_earned DECIMAL(12,2),
  risk_approval_id TEXT,
  linked_event_id UUID REFERENCES trade_ledger(id),
  phase TEXT DEFAULT 'paper',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE IF NOT EXISTS agent_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc TIMESTAMPTZ DEFAULT NOW(),
  agent_id TEXT NOT NULL,
  action_type TEXT NOT NULL,
  action_detail JSONB,
  outcome TEXT,
  error_message TEXT
);
CREATE TABLE IF NOT EXISTS portfolio_state (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc TIMESTAMPTZ DEFAULT NOW(),
  total_capital DECIMAL(14,4),
  operations_bucket DECIMAL(14,4),
  reserve_bucket DECIMAL(14,4),
  personal_bucket DECIMAL(14,4),
  three_buckets_active BOOLEAN DEFAULT FALSE,
  drawdown_from_peak DECIMAL(5,4)
);
CREATE TABLE IF NOT EXISTS wallet_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  chain TEXT NOT NULL,
  department TEXT,
  created_date DATE NOT NULL,
  status TEXT DEFAULT 'aging',
  antidetect_profile_id TEXT,
  proxy_assigned BOOLEAN DEFAULT FALSE,
  last_activity TIMESTAMPTZ,
  notes TEXT
);
CREATE TABLE IF NOT EXISTS paper_trades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc TIMESTAMPTZ DEFAULT NOW(),
  agent_id TEXT NOT NULL,
  trade_type TEXT NOT NULL,
  description TEXT,
  my_probability DECIMAL(4,3),
  market_probability DECIMAL(4,3),
  simulated_size DECIMAL(12,4),
  outcome TEXT,
  outcome_pnl DECIMAL(12,4),
  notes TEXT
);
CREATE TABLE IF NOT EXISTS company_wiki (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc TIMESTAMPTZ DEFAULT NOW(),
  author_agent TEXT NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[],
  useful_to TEXT[]
);
CREATE TABLE IF NOT EXISTS department_status (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id TEXT NOT NULL UNIQUE,
  phase TEXT DEFAULT 'setup',
  benchmark_target JSONB,
  benchmark_current JSONB,
  consecutive_miss_days INTEGER DEFAULT 0,
  capital_allocated DECIMAL(12,4) DEFAULT 0,
  total_pnl DECIMAL(12,4) DEFAULT 0,
  status_updated TIMESTAMPTZ DEFAULT NOW()
);
INSERT INTO department_status (department_id, phase) VALUES
  ('factory', 'setup'), ('sniper', 'setup'), ('trader_farmer', 'setup'),
  ('trader_quant', 'setup'), ('prediction_god', 'setup')
ON CONFLICT (department_id) DO NOTHING;
CREATE INDEX IF NOT EXISTS idx_trade_ledger_agent ON trade_ledger(agent_id);
CREATE INDEX IF NOT EXISTS idx_trade_ledger_stream ON trade_ledger(stream);
CREATE INDEX IF NOT EXISTS idx_agent_actions_agent ON agent_actions(agent_id);
CREATE INDEX IF NOT EXISTS idx_paper_trades_agent ON paper_trades(agent_id);
`;
    
    console.log('\n📦 Creating tables...');
    await client.query(schemaSQL);
    
    const result = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    console.log('\n📋 Tables created:');
    for (const row of result.rows) {
      console.log(`   ✅ ${row.table_name}`);
    }
    
    client.release();
    await pool.end();
    console.log('\n🎉 Supabase schema deployed!\n');
  } catch (err) {
    console.error('\n❌ Failed:', err.message);
    await pool.end();
    
    // If still fails, provide manual instructions
    console.log('\n⚠️  Database connection unavailable.');
    console.log('Please deploy manually via Supabase Dashboard:');
    console.log('   1. https://supabase.com/dashboard');
    console.log('   2. Project: mpscpjxbasugtaxkxqkw');
    console.log('   3. SQL Editor > Run supabase_schema.sql');
    process.exit(1);
  }
}

deploy();
