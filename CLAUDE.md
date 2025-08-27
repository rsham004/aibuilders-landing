# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a GitHub Discussion thread creation tool that automates the process of creating discussion threads in the AI Builders community from markdown challenge files stored in a wiki repository.

**Core Functionality:**
- Sources markdown files from `AI-Product-Development/wiki/challenges` directory
- Creates GitHub Discussions in `AI-Product-Development/aibuilders/discussions`
- Automatically categorizes discussions under "Challenges or Collaborations"
- Enhances original content with community participation guidelines
- Handles both local and remote source files via temporary cloning

## Architecture

**Main Components:**
- `create-aibuilders-discussions.js` - Primary Node.js implementation (recommended for Windows)
- `create-aibuilders-discussions.sh` - Bash script alternative (requires WSL/Git Bash on Windows)
- `run-script.bat` - Windows helper that provides choice between Node.js and bash versions

**Key Functions (`create-aibuilders-discussions.js`):**
- `extractTitle()` - Extracts discussion title from markdown heading or filename
- `createChallengeBody()` - Wraps original content with community participation template
- `getAllMarkdownFiles()` - Recursively finds all .md files in challenges directory
- `getChallengesCategoryId()` - Discovers the appropriate GitHub discussion category
- `createDiscussion()` - Uses GitHub CLI to create the actual discussion thread

## Development Commands

**Run the tool:**
```bash
# Node.js version (recommended)
node create-aibuilders-discussions.js

# Or use npm scripts
npm start
npm run create-discussions

# Windows batch helper
run-script.bat

# Bash version (requires WSL/Git Bash on Windows)
bash create-aibuilders-discussions.sh
```

**Prerequisites:**
- Node.js >= 14.0.0
- GitHub CLI (`gh`) installed and authenticated (`gh auth login`)
- Write access to the target repository (`AI-Product-Development/aibuilders`)

## Output Files

The tool generates several output files:
- `created-discussions.txt` - Simple list of created discussion URLs
- `aibuilders-discussions-results.json` - Detailed results with metadata
- `temp_wiki/` - Temporary wiki clone (auto-cleaned)

## Content Enhancement

Original markdown files are enhanced with:
- Community-focused header (`# 🎯 AI Builder Challenge`)
- Standardized participation guidelines section
- Resource links back to source wiki and community
- Attribution footer

## Rate Limiting & Error Handling

- 2-second delay between API calls to respect GitHub rate limits
- Graceful handling of authentication and permission errors
- Detailed error reporting with file-specific failure tracking
- Automatic cleanup of temporary files

## Platform Considerations

**Windows-specific notes:**
- Node.js script works natively on Windows
- Bash script requires WSL, Git Bash, or similar Unix environment
- Batch helper provides user-friendly interface for choosing execution method