# Dev Team Specification: Automated Workspace Backup/Sync (TASK-003)

## Overview
Oracle VPS instances can be terminated without warning. We need an automated backup system for all critical company data (workspace, configuration, logs). This also doubles as our Obsidian sync method for Max.

## Requirements
- Must securely commit and push the contents of `/home/ubuntu/.openclaw/workspace` to a remote, private GitHub repository.
- Must run automatically on a set schedule (e.g., via cron or a background daemon).
- The DevTeam already has a GitHub PAT (`.github_token`) configured in their sandbox.
- **Constraints:** Ensure the `.env` file and any raw credential files (like the `.github_token` itself) are explicitly excluded via `.gitignore` before pushing.
- **Target Repository:** https://github.com/RunHobbitRun/orchard-workspace-sync
