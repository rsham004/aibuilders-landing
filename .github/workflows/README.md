# GitHub Actions Workflows

This repository has **two separate automation systems** that work independently:

## 📰 GitHub Discussions System
Handles the main website functionality for displaying AI Builders Community discussions.

### Files:
- `update-site.yml` - Auto-updates discussions every 30 minutes
- `manual-update.yml` - Manual trigger for discussions updates

### What it does:
- Fetches latest discussions from AI-Product-Development/aibuilders
- Updates `aibuilders-discussions-results.json`
- Updates `index.html` timestamp
- Commits changes using `github-actions[bot]`

### Schedule: Every 30 minutes
### Files touched: `aibuilders-discussions-results.json`, `index.html`

---

## 📱 LinkedIn Marketing System
Handles automated LinkedIn posting completely separate from discussions.

### Files:
- `linkedin-automation.yml` - Weekly LinkedIn posts

### What it does:
- Posts AI Builders Community content to LinkedIn
- Logs all activity in `marketing/` folder
- Creates GitHub issues for success/failure tracking
- Commits log updates using `LinkedIn Marketing Bot`

### Schedule: Every Sunday at 5:00 PM NZST
### Files touched: `marketing/logs/*`, `marketing/posts/*/posting-log.json`

---

## 🚫 No Conflicts
These workflows are designed to **never interfere** with each other:

1. **Different schedules** - Discussions (every 30 min) vs LinkedIn (weekly)
2. **Different files** - No overlap in files modified
3. **Different git users** - Different bot identities for commits
4. **Different purposes** - Website updates vs social media marketing

Both can run simultaneously without any issues.