# Marketing Logs

This folder contains centralized logging for all marketing activities.

## Log Types

### Individual Post Logs
- Located in each post folder as `posting-log.json`
- Tracks specific post performance and history
- Records LinkedIn post IDs, engagement metrics, and status

### Central Activity Log
- `activity.log` - All marketing automation activities
- `errors.log` - Failed posts and error details
- `performance.json` - Aggregated analytics across all posts

## Log Structure

### Posting Log (`posting-log.json`)
```json
{
  "post_id": "unique-identifier",
  "total_posts": 0,
  "last_posted": "ISO-date",
  "posting_history": [
    {
      "date": "ISO-date",
      "platform": "linkedin",
      "post_id": "platform-post-id",
      "status": "success|failed",
      "engagement": {...},
      "notes": "description"
    }
  ]
}
```

### Activity Log Format
```
[TIMESTAMP] [LEVEL] [POST_ID] [PLATFORM] Message
```

Example:
```
2025-08-30T17:00:00Z INFO ai-builders-community linkedin Post scheduled
2025-08-30T17:00:05Z SUCCESS ai-builders-community linkedin Posted: urn:li:share:1234567890
2025-08-30T17:00:10Z ERROR another-post linkedin Failed: Invalid access token
```

## Usage

Logs are automatically updated by the GitHub Actions workflow when posts are published. You can review:

- **Success/failure rates** by checking status in posting logs
- **Performance trends** by analyzing engagement metrics over time
- **Posting frequency** by reviewing dates in the posting history
- **Error patterns** by examining failed posts

## Maintenance

- Logs are automatically rotated when they exceed 1000 entries
- Old logs are archived with timestamps
- Performance data is aggregated monthly for reporting