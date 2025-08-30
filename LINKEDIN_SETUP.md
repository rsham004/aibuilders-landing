# LinkedIn Auto-Posting Setup Guide

This guide will help you set up automated LinkedIn posting that runs every Sunday at 5 PM NZST.

## Step 1: Create a LinkedIn Developer App

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Sign in with your LinkedIn account
3. Click "Create app"
4. Fill in the required information:
   - **App name**: "AI Builders Community Auto-Post"
   - **LinkedIn Page**: (Select your company page if you have one)
   - **Privacy policy URL**: Your website's privacy policy
   - **App logo**: Upload a logo (optional)

## Step 2: Configure App Permissions

1. In your app dashboard, go to the "Auth" tab
2. Add these scopes under "OAuth 2.0 scopes":
   - `r_liteprofile` - Read access to basic profile
   - `w_member_social` - Write access to share content

## Step 3: Generate Access Token

### Option A: Using LinkedIn's Token Generator (Temporary - 60 days)
1. In your app dashboard, go to the "Auth" tab
2. Under "OAuth 2.0 settings", you'll see "Access tokens"
3. Generate a token (this will expire in 60 days)

### Option B: Implement Full OAuth Flow (Recommended for Production)
For long-term automation, you'll need to implement the full OAuth flow. Here's a simplified approach:

1. Get authorization URL:
```
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=r_liteprofile%20w_member_social
```

2. After user authorization, exchange code for access token using LinkedIn API

## Step 4: Get Your Person URN

1. Use the LinkedIn API to get your profile:
```bash
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
     https://api.linkedin.com/v2/people/~
```

2. Look for the `id` field in the response - this is your person URN

## Step 5: Configure GitHub Secrets

1. Go to your GitHub repository
2. Click "Settings" → "Secrets and variables" → "Actions"
3. Add these repository secrets:

### Required Secrets:
- **LINKEDIN_ACCESS_TOKEN**: Your LinkedIn access token
- **LINKEDIN_PERSON_URN**: Your person URN (format: `urn:li:person:YOUR_ID`)

## Step 6: Test the Automation

1. Go to your repository's "Actions" tab
2. Find "Weekly LinkedIn Post" workflow
3. Click "Run workflow" to test manually
4. Check the logs to ensure it works correctly

## Schedule Details

- **Frequency**: Every Sunday
- **Time**: 5:00 PM NZST (17:00)
- **GitHub Actions Cron**: `0 5 * * 0` (5:00 AM UTC = 6:00 PM NZDT / 5:00 PM NZST)

## Customizing the Post Content

To change the post content:
1. Edit `.github/scripts/linkedin-post.js`
2. Update the `POST_CONTENT` variable
3. Commit and push changes

## Troubleshooting

### Common Issues:
1. **401 Unauthorized**: Check your access token
2. **403 Forbidden**: Verify app permissions and scopes
3. **Token Expired**: Generate a new access token

### Checking Logs:
- Go to Actions tab in your repository
- Click on the latest workflow run
- Check the logs for detailed error messages

## Security Notes

- Never commit access tokens to your repository
- Use GitHub Secrets for all sensitive information
- Consider implementing token refresh for long-term automation
- Monitor your LinkedIn app usage to stay within API limits

## Alternative: Manual Posting Reminder

If LinkedIn API setup is too complex, we can create a simpler reminder system that:
- Creates GitHub Issues with the post content every Sunday
- Sends you a notification to manually post
- Much easier to set up and maintain