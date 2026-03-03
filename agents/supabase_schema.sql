-- OpenClaw Orchard — Supabase Schema
-- Run this in your Supabase SQL editor

-- ── Trade Ledger ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trade_ledger (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc   TIMESTAMPTZ DEFAULT NOW(),
  agent_id        TEXT NOT NULL,
  event_type      TEXT NOT NULL, -- SIGNAL | PLAN | RISK_CHECK | EXECUTION | OUTCOME | LESSON | ALERT | FARM_EVENT
  stream          TEXT NOT NULL, -- FACTORY | SNIPER | TRADER_FARMER | TRADER_QUANT | PREDICTION | FINANCE | SECURITY | MANAGER | DEVTEAM | SCOUT | INTELLIGENCE | AUDITOR
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
  age_days        INTEGER GENERATED ALWAYS AS (CURRENT_DATE - created_date) STORED,
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

-- ── Capital Requests ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS capital_requests (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id          TEXT NOT NULL UNIQUE,
  timestamp_utc       TIMESTAMPTZ DEFAULT NOW(),
  department_id       TEXT NOT NULL,
  requested_amount    DECIMAL(14,4) NOT NULL,
  approved_amount     DECIMAL(14,4),
  currency            TEXT DEFAULT 'USDC',
  reason              TEXT NOT NULL,
  approved_by_manager BOOLEAN DEFAULT FALSE,
  requires_max_approval BOOLEAN DEFAULT FALSE,
  status              TEXT DEFAULT 'pending', -- pending | approved | denied | cancelled
  resolved_at         TIMESTAMPTZ,
  resolver_agent      TEXT,
  notes               TEXT
);

-- ── Wallet Profiles (Sniper) ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS wallet_profiles (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc       TIMESTAMPTZ DEFAULT NOW(),
  wallet_address      TEXT NOT NULL UNIQUE,
  chain               TEXT DEFAULT 'solana',
  category            TEXT NOT NULL, -- dev | sniper | bank | misc
  observed_trades     INTEGER DEFAULT 0,
  win_rate            DECIMAL(5,2),  -- 0.00 to 100.00
  avg_hold_minutes    INTEGER,
  avg_position_size   DECIMAL(14,4),
  consecutive_wins    INTEGER DEFAULT 0,
  consecutive_losses  INTEGER DEFAULT 0,
  confidence_score    DECIMAL(4,2),  -- 0.00 to 10.00
  watchlist_status    TEXT DEFAULT 'candidate', -- candidate | active | removed
  last_trade_at       TIMESTAMPTZ,
  notes               TEXT
);

-- ── Quant Strategy Candidates ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS strategy_candidates (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc       TIMESTAMPTZ DEFAULT NOW(),
  strategy_name       TEXT NOT NULL,
  market              TEXT NOT NULL, -- perp | spot | prediction
  agent_id            TEXT DEFAULT 'trader_quant',
  rules               JSONB,
  stage               TEXT DEFAULT 'research', -- research | backtest | paper | approved | rejected
  sharpe_ratio        DECIMAL(8,4),
  max_drawdown        DECIMAL(8,4),
  win_rate            DECIMAL(5,2),
  profit_factor       DECIMAL(8,4),
  backtest_from       DATE,
  backtest_to         DATE,
  approved_for_capital BOOLEAN DEFAULT FALSE,
  notes               TEXT
);

-- ── Intelligence Brief Archive ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS market_briefs (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc       TIMESTAMPTZ DEFAULT NOW(),
  brief_type          TEXT NOT NULL, -- standard | urgent | macro
  market_bias         TEXT,          -- bullish | neutral | bearish
  key_events          JSONB,
  notable_signals     JSONB,
  payload             JSONB,
  sent_to_manager     BOOLEAN DEFAULT FALSE
);

-- ── Alerts Log ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts_log (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc       TIMESTAMPTZ DEFAULT NOW(),
  source_agent        TEXT NOT NULL,
  severity            TEXT NOT NULL, -- info | warning | critical
  title               TEXT NOT NULL,
  detail              TEXT,
  target              TEXT NOT NULL, -- manager | auditor | max
  acknowledged        BOOLEAN DEFAULT FALSE,
  acknowledged_by     TEXT,
  acknowledged_at     TIMESTAMPTZ
);

-- ── Dev Team Queue ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dev_tasks (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timestamp_utc       TIMESTAMPTZ DEFAULT NOW(),
  title               TEXT NOT NULL,
  department_id       TEXT NOT NULL,
  priority            TEXT NOT NULL, -- critical | high | medium | low
  status              TEXT DEFAULT 'pending', -- pending | in_progress | blocked | done
  requested_by        TEXT NOT NULL,
  owner_agent         TEXT DEFAULT 'devteam',
  spec                JSONB,
  blocker             TEXT,
  due_at              TIMESTAMPTZ,
  completed_at        TIMESTAMPTZ
);

-- ── System Thresholds ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS system_thresholds (
  metric              TEXT PRIMARY KEY,
  value_num           DECIMAL(14,4),
  value_text          TEXT,
  updated_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_by          TEXT
);

INSERT INTO system_thresholds (metric, value_num, value_text) VALUES
  ('reserve_floor', 1500, 'Set your floor in base currency'),
  ('max_drawdown', 0.40, '40% hard-stop drawdown'),
  ('loop_actions_per_minute', 10, 'Loop detector threshold')
ON CONFLICT (metric) DO NOTHING;

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
CREATE INDEX IF NOT EXISTS idx_capital_requests_status ON capital_requests(status);
CREATE INDEX IF NOT EXISTS idx_capital_requests_dept   ON capital_requests(department_id);
CREATE INDEX IF NOT EXISTS idx_wallet_profiles_status  ON wallet_profiles(watchlist_status);
CREATE INDEX IF NOT EXISTS idx_wallet_profiles_winrate ON wallet_profiles(win_rate DESC);
CREATE INDEX IF NOT EXISTS idx_strategy_candidates_stage ON strategy_candidates(stage);
CREATE INDEX IF NOT EXISTS idx_market_briefs_ts        ON market_briefs(timestamp_utc DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_log_open         ON alerts_log(acknowledged, severity, timestamp_utc DESC);
CREATE INDEX IF NOT EXISTS idx_dev_tasks_status        ON dev_tasks(status, priority, timestamp_utc DESC);
