# Marketing Automation

This folder contains the marketing content and configuration for automated social media posting.

## Folder Structure

```
marketing/
├── config.json                      # Main marketing configuration
├── posts/                          # Individual post folders
│   └── ai-builders-community/      # Specific post folder
│       ├── content.md              # Human-readable content
│       ├── config.json             # Post-specific configuration
│       └── linkedin.json           # LinkedIn-formatted content
└── README.md                       # This file
```

## Adding New Posts

1. Create a new folder in `posts/` with a descriptive name
2. Add the required files:
   - `content.md` - Human-readable content
   - `config.json` - Post configuration (schedule, platforms, etc.)
   - `linkedin.json` - LinkedIn-specific formatting
3. Update the main `config.json` to include the new post

## Configuration Files

### Post Config (`posts/[post-name]/config.json`)

- **post_id**: Unique identifier for the post
- **schedule.frequency**: "weekly", "daily", "monthly"
- **schedule.day_of_week**: "sunday", "monday", etc. (for weekly)
- **schedule.time**: Time in HH:MM format (24-hour)
- **schedule.timezone**: Timezone for scheduling
- **platforms**: Array of platforms to post to
- **active**: Boolean to enable/disable the post

### LinkedIn Config (`posts/[post-name]/linkedin.json`)

- **author_urn**: LinkedIn person URN
- **content.text**: Full post text with formatting
- **visibility**: "PUBLIC", "CONNECTIONS", etc.

## Current Active Posts

- **ai-builders-community**: Weekly Sunday posts at 5:00 PM NZST promoting the AI Builders Community

## Usage

The GitHub Actions workflow reads these configuration files to determine:
- What content to post
- When to post it
- Which platforms to post to
- How to format the content for each platform

To modify the posting schedule or content, simply edit the relevant configuration files.