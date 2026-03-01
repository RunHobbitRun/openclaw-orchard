#!/bin/bash
# Workspace automated backup sync script
# Reads token from hidden file and pushes without storing it in config

set -e

WORKSPACE="/home/ubuntu/.openclaw/workspace"
TOKEN_FILE="${WORKSPACE}/.github_token"

if [ -f "$TOKEN_FILE" ]; then
    GITHUB_TOKEN=$(cat "$TOKEN_FILE")
else
    echo "Error: Token file not found"
    exit 1
fi

git config --global user.email "devteam@openclaw.local" 2>/dev/null || true
git config --global user.name "DevTeam" 2>/dev/null || true

cd "$WORKSPACE"
git add -A

if git diff --staged --quiet; then
    echo "No changes to sync"
    exit 0
fi

git commit -m "Workspace backup: $(date -u '+%Y-%m-%d %H:%M UTC')"

# Push dynamically to the correct repo using token
REPO_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/RunHobbitRun/orchard-workspace-sync.git"

git push -u "${REPO_URL}" main 2>/dev/null || git push -u "${REPO_URL}" master 2>/dev/null || {
    echo "Failed to push to orchard-workspace-sync"
    exit 1
}

echo "Sync complete: $(date -u)"
