# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AI Builders Community landing page that displays GitHub Discussions from the AI-Product-Development/aibuilders repository. It's a static site hosted on GitHub Pages that automatically updates every 30 minutes to show the latest community discussions.

## Architecture

The project has a simple 3-component architecture:

1. **Data Layer**: `fetch-discussions.js` - Node.js script that uses GitHub CLI to fetch discussion data
2. **Storage Layer**: `aibuilders-discussions-results.json` - JSON file containing cached discussion data
3. **Presentation Layer**: `index.html` - Single-page application with embedded JavaScript

### Key Components

- **DiscussionsApp Class** (index.html:395): Main JavaScript application class that handles data loading, filtering, search, and rendering
- **GitHub Actions Workflows**: Two workflows for automated updates:
  - `update-site.yml`: Runs every 30 minutes automatically
  - `manual-update.yml`: Triggered manually via GitHub Actions

## Common Commands

```bash
# Fetch latest discussions manually
npm start
# or
node fetch-discussions.js

# Serve the site locally
npm run serve
# or
python -m http.server 8000

# Manually trigger discussion update (requires GitHub CLI)
gh workflow run manual-update.yml

# Check workflow status
gh run list
```

## Data Flow

1. GitHub Actions runs `fetch-discussions.js` every 30 minutes
2. Script uses `gh api` to fetch discussions from AI-Product-Development/aibuilders
3. Data is saved to `aibuilders-discussions-results.json` 
4. HTML timestamp comment is updated for cache-busting
5. Changes are committed and pushed, triggering GitHub Pages deployment

## Cache Management

The site implements multiple cache-busting mechanisms:
- HTTP meta tags in HTML header
- Timestamp query parameters on JSON requests (`?t=${Date.now()}`)
- HTML comment timestamp for forcing page refreshes
- GitHub Pages deployment on every data update

## Important Technical Notes

- **GitHub CLI Required**: The fetch script requires `gh` CLI to be authenticated
- **Public Repository Only**: Fetches from public AI-Product-Development/aibuilders repo
- **No Build Process**: Pure HTML/CSS/JS with no compilation step
- **Responsive Design**: Works on desktop and mobile
- **Real-time Updates**: Recent Activity section shows actual discussion data, not mock data

## GitHub Actions Environment

- Requires `contents: write` permissions
- Uses standard `GITHUB_TOKEN` (no custom PAT needed)
- Configured for Node.js 18
- Pre-installed GitHub CLI on runners

## Data Structure

The JSON file contains an array of discussion objects with:
- `title`, `url`, `number`, `category`
- `created_at`, `updated_at`, `comments`
- `user`, `body` (truncated)

The frontend transforms this data for display and sorting by recency.