# Instagram Integration Setup

This guide will help you set up automated Instagram posting for your AI Builders discussions.

## Prerequisites

- Personal Instagram account
- GitHub repository with Actions enabled
- Node.js installed locally (for testing)

## Setup Instructions

### 1. Install Dependencies

Run the following command in your project directory:

```bash
npm install
```

### 2. Configure GitHub Secrets

You need to add your Instagram credentials as GitHub repository secrets:

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

   - **Name**: `INSTAGRAM_USERNAME`
   - **Value**: Your Instagram username (without @)

   - **Name**: `INSTAGRAM_PASSWORD`  
   - **Value**: Your Instagram password

⚠️ **Security Note**: These credentials are encrypted and only accessible to GitHub Actions. Never commit credentials to your repository.

### 3. Test Locally (Optional)

To test Instagram posting locally:

1. Create a `.env` file in your project root:
```bash
INSTAGRAM_USERNAME=your_username
INSTAGRAM_PASSWORD=your_password
```

2. Run the Instagram posting script:
```bash
npm run post-instagram
```

3. **Important**: Add `.env` to your `.gitignore` file to prevent committing credentials.

### 4. How It Works

The automated Instagram posting:

- Runs every 30 minutes as part of the existing workflow
- Checks for new discussions since the last post
- Posts the most recent new discussion to Instagram Stories
- Formats the content with proper hashtags and links
- Tracks what was posted in `last-instagram-post.json`

### 5. Post Format

Instagram posts will include:
- Discussion title
- Truncated discussion content (first 200 characters)
- Link to the full discussion
- Relevant hashtags: #AIBuilders #AI #MachineLearning #TechCommunity

### 6. Troubleshooting

**Challenge Required**: Instagram may require verification for new devices/locations:
- This shows as "challenge_required" or "useragent mismatch" errors
- Instagram's security measures detect automated access
- The automation may work better after manual login from the same IP
- Consider using Instagram's official Business API for more reliable automation

**Rate Limiting**: Instagram may rate limit frequent posts. The script includes error handling and will retry on the next scheduled run.

**Login Issues**: If you have two-factor authentication enabled:
- Instagram's unofficial APIs may not work reliably with 2FA
- Consider temporarily disabling 2FA for automation (not recommended for security)
- Or upgrade to Instagram Business account with official API access

**User Agent Mismatch**: If you see "useragent mismatch" errors:
- Instagram is blocking requests that don't look like genuine app usage
- This is expected behavior from Instagram's security systems
- The script includes user agent spoofing but Instagram may still detect automation

**No New Posts**: The script only posts when there are new discussions. Check `instagram-posting-log.json` to see the last posting activity.

### 7. Manual Posting

To manually trigger Instagram posting:

1. Go to your GitHub repository
2. Navigate to **Actions**
3. Select "Auto Update Discussions" workflow
4. Click "Run workflow"

### 8. Monitoring

Check the GitHub Actions logs to monitor posting activity:
- Successful posts will show "✅ Successfully posted to Instagram story!"
- Failed posts will show error details for troubleshooting

## Files Added/Modified

- `post-to-instagram.js` - Main Instagram posting script
- `package.json` - Added instagram-private-api dependency
- `.github/workflows/update-site.yml` - Updated to include Instagram posting
- `last-instagram-post.json` - Created automatically to track posting history

## Important Notes

- This uses an unofficial Instagram API which may break if Instagram changes their systems
- For production use, consider upgrading to an Instagram Business account and using official APIs
- The script posts to Instagram Stories (not feed posts) as it's text-focused content
- Posts are rate-limited to prevent spam and account suspension