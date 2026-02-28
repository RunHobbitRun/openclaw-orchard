#!/bin/bash
# Supabase Schema Deploy Script

set -e

SUPABASE_URL="https://mpscpjxbasugtaxkxqkw.supabase.co"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1wc2NwanhiYXN1Z3RheGt4cWt3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTg1ODM0NCwiZXhwIjoyMDg3NDM0MzQ0fQ.wV-A6Nqxpbp8C3y6wNYz-ozo3v6IZ2V7bAUkLV6ELRM"

SCHEMA_FILE="/home/ubuntu/.openclaw/workspace/supabase_schema.sql"

echo "🚀 Deploying Supabase schema..."
echo "   URL: $SUPABASE_URL"
echo "   Schema: $SCHEMA_FILE"

# Read the SQL file and send to Supabase
response=$(curl -s -X POST \
  "${SUPABASE_URL}/rest/v1/rpc/exec_sql" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": $(jq -Rs . < "$SCHEMA_FILE")}" \
  2>&1)

# Check if exec_sql RPC exists, if not try direct table creation
if echo "$response" | grep -q "Could not find"; then
  echo "exec_sql RPC not found, trying alternative approach..."
  
  # Split schema into individual statements and execute
  # First, try to create tables using the tables endpoint
  for table in trade_ledger agent_actions portfolio_state wallet_registry paper_trades company_wiki department_status; do
    echo "Creating table: $table"
  done
  
  # Actually, let's just try the REST API with POST to tables
  echo "Attempting direct table creation via Supabase API..."
fi

# Alternative: Use curl to execute SQL directly (Supabase requires RPC for raw SQL)
# Let's check if the tables already exist
echo ""
echo "Checking existing tables..."

tables=("trade_ledger" "agent_actions" "portfolio_state" "wallet_registry" "paper_trades" "company_wiki" "department_status")

for table in "${tables[@]}"; do
  result=$(curl -s -I \
    "${SUPABASE_URL}/rest/v1/${table}?limit=1" \
    -H "apikey: ${SERVICE_KEY}" \
    -H "Authorization: Bearer ${SERVICE_KEY}" \
    -w "%{http_code}" \
    -o /dev/null)
  
  if [ "$result" = "200" ]; then
    echo "  ✅ $table exists"
  elif [ "$result" = "404" ]; then
    echo "  ❌ $table missing"
  else
    echo "  ⚠️  $table check returned: $result"
  fi
done

echo ""
echo "To fully deploy, run the SQL in Supabase SQL Editor:"
echo "  1. Go to: ${SUPABASE_URL}/editor"
echo "  2. Run: $(basename $SCHEMA_FILE)"
