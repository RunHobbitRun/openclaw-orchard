-- OpenClaw Orchard — Supabase Schema
-- Run this in your Supabase SQL editor

-- ── Trade Ledger ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trade_ledger (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc   TIMESTAMPTZ DEFAULT NOW(),
  agent_id        TEXT NOT NULL,
  event_type      TEXT NOT NULL, -- SIGNAL | PLAN | RISK_CHECK | EXECUTION | OUTCOME | LESSON | ALERT | FARM_EVENT
  stream          TEXT NOT NULL, -- FACTORY | SNIPER | TRADER_FARMER | TRADER_QUANT | PREDICTION
  strategy        TEXT,          -- DELTA_NEUTRAL | TRIANGLE_LOOP | COPY_TRADE | NBA_MODEL | CRYPTO_EVENT | etc
  wallet_id       TEXT,
  payload         JSONB,
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00
  outcome_pnl     DECIMAL(12,4),
  cost_per_point  DECIMAL(12,6),
  points_earned   DECIMAL(12,2),
  risk_approval_id TEXT,
  linked_event_id  UUID REFERENCES trade_ledger(id),
  phase           TEXT DEFAULT 'paper', -- paper | live
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Agent Actions ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS agent_actions (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc   TIMESTAMPTZ DEFAULT NOW(),
  agent_id        TEXT NOT NULL,
  action_type     TEXT NOT NULL,
  action_detail   JSONB,
  outcome         TEXT,          -- SUCCESS | FAILURE | PENDING
  error_message   TEXT
);

-- ── Portfolio State ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS portfolio_state (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc   TIMESTAMPTZ DEFAULT NOW(),
  total_capital   DECIMAL(14,4),
  operations_bucket DECIMAL(14,4),
  reserve_bucket  DECIMAL(14,4),
  personal_bucket DECIMAL(14,4),
  three_buckets_active BOOLEAN DEFAULT FALSE,
  drawdown_from_peak DECIMAL(5,4) -- 0.0000 to 1.0000
);

-- ── Wallet Registry ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_registry (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address  TEXT NOT NULL UNIQUE,
  chain           TEXT NOT NULL,  -- solana | hyperliquid | etc
  department      TEXT,           -- factory | sniper | trader_farmer | studio
  created_date    DATE NOT NULL,

  status          TEXT DEFAULT 'aging', -- aging | ready | active | compromised | retired
  antidetect_profile_id TEXT,
  proxy_assigned  BOOLEAN DEFAULT FALSE,
  last_activity   TIMESTAMPTZ,
  notes           TEXT
);

-- ── Paper Trades ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS paper_trades (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc   TIMESTAMPTZ DEFAULT NOW(),
  agent_id        TEXT NOT NULL,
  trade_type      TEXT NOT NULL,  -- SNIPER | FARMER | QUANT | PREDICTION
  description     TEXT,
  my_probability  DECIMAL(4,3),   -- for prediction
  market_probability DECIMAL(4,3),-- for prediction
  simulated_size  DECIMAL(12,4),
  outcome         TEXT,           -- WIN | LOSS | PENDING
  outcome_pnl     DECIMAL(12,4),
  notes           TEXT
);

-- ── Company Wiki ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_wiki (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc   TIMESTAMPTZ DEFAULT NOW(),
  author_agent    TEXT NOT NULL,
  category        TEXT NOT NULL,  -- LESSON | STRATEGY | PROTOCOL | POSTMORTEM | ALPHA
  title           TEXT NOT NULL,
  content         TEXT NOT NULL,
  tags            TEXT[],
  useful_to       TEXT[]          -- which departments benefit from this entry
);

-- ── Department Status ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS department_status (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  department_id   TEXT NOT NULL UNIQUE,
  phase           TEXT DEFAULT 'setup',  -- setup | paper | live | warning | closed
  benchmark_target JSONB,
  benchmark_current JSONB,
  consecutive_miss_days INTEGER DEFAULT 0,
  capital_allocated DECIMAL(12,4) DEFAULT 0,
  total_pnl       DECIMAL(12,4) DEFAULT 0,
  status_updated  TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial department records
INSERT INTO department_status (department_id, phase) VALUES
  ('factory', 'setup'),
  ('sniper', 'setup'),
  ('trader_farmer', 'setup'),
  ('trader_quant', 'setup'),
  ('prediction_god', 'setup')
ON CONFLICT (department_id) DO NOTHING;

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_trade_ledger_agent    ON trade_ledger(agent_id);
CREATE INDEX IF NOT EXISTS idx_trade_ledger_stream   ON trade_ledger(stream);
CREATE INDEX IF NOT EXISTS idx_trade_ledger_ts       ON trade_ledger(timestamp_utc DESC);
CREATE INDEX IF NOT EXISTS idx_agent_actions_agent   ON agent_actions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_ts      ON agent_actions(timestamp_utc DESC);
CREATE INDEX IF NOT EXISTS idx_paper_trades_agent    ON paper_trades(agent_id);
CREATE INDEX IF NOT EXISTS idx_wiki_category         ON company_wiki(category);
