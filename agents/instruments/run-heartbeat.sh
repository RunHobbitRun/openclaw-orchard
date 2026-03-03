#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 <agent>"
  echo "Example: $0 manager"
  exit 1
fi

agent="$1"
base_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
run_sql="$base_dir/run-sql.sh"

template_path=""
case "$agent" in
  manager) template_path="$base_dir/templates/manager-daily-brief.md" ;;
  auditor) template_path="$base_dir/templates/auditor-critical-alert.md" ;;
  finance) template_path="$base_dir/templates/finance-daily-report.md" ;;
  security) template_path="$base_dir/templates/security-incident.md" ;;
  intelligence) template_path="$base_dir/templates/intelligence-standard-brief.md" ;;
  scout) template_path="$base_dir/templates/scout-proposal.md" ;;
  factory) template_path="$base_dir/templates/factory-package.md" ;;
  sniper) template_path="$base_dir/templates/sniper-watchlist.md" ;;
  trader_farmer) template_path="$base_dir/templates/trader-farmer-report.md" ;;
  trader_quant) template_path="$base_dir/templates/trader-quant-report.md" ;;
  prediction_god) template_path="$base_dir/templates/prediction-recommendation.md" ;;
  devteam) template_path="$base_dir/templates/devteam-delivery-note.md" ;;
  *)
    echo "Unknown agent: $agent"
    echo "Supported: manager auditor finance security intelligence scout factory sniper trader_farmer trader_quant prediction_god devteam"
    exit 1
    ;;
esac

"$run_sql" "$agent"

echo
echo "=== TEMPLATE TO USE ==="
echo "$template_path"
