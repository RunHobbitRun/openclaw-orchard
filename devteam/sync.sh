#!/bin/bash
# Workspace automated backup sync script
# Uses GitHub PAT from environment variable GITHUB_PAT
# This script syncs /home/ubuntu/.openclaw/workspace to GitHub

set -e

WORKSPACE="/home/ubuntu/.openclaw/workspace"
GITHUB_TOKEN="${GITHUB_PAT}"

# Configure git if not already done
git config --global user.email "devteam@openclaw.local" 2>/dev/null || true
git config --global user.name "DevTeam" 2>/dev/null || true

cd "$WORKSPACE"

# Add all changes
git add -A

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "No changes to sync"
    exit 0
fi

# Commit with timestamp
git commit -m "Workspace backup: $(date -u '+%Y-%m-%d %H:%M UTC')"

# Push to remote
git push -u origin main 2>/dev/null || git push -u origin master 2>/dev/null || {
    # If remote doesn't exist, try to create it or prompt user
    echo "No remote configured. Please add a remote:"
    echo "  git remote add origin https://x-access-token:\${GITHUB_TOKEN}@github.com/OWNER/REPO.git"
    exit 1
}

echo "Sync complete: $(date -u)"
