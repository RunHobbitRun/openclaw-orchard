#!/bin/bash
# Workspace automated backup sync script
# Syncs /home/ubuntu/.openclaw/workspace to GitHub
# Uses GITHUB_PAT from environment

set -e

WORKSPACE="/home/ubuntu/.openclaw/workspace"
GITHUB_TOKEN="${GITHUB_PAT}"
REPO="RunHobbitRun/openclaw-orchard"

cd "$WORKSPACE"

# Configure git if not already done
git config user.email "devteam@openclaw.local" 2>/dev/null || true
git config user.name "DevTeam" 2>/dev/null || true

# Add all changes (respects .gitignore)
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "No changes to sync"
    exit 0
fi

# Commit with timestamp
git commit -m "Workspace backup: $(date -u '+%Y-%m-%d %H:%M UTC')"

# Push to remote
git push -u origin master

echo "Sync complete: $(date -u)"
