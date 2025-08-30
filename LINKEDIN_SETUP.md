# LinkedIn OAuth Setup Guide
## AI Builders Community - Automated Posting

This guide will help you set up LinkedIn OAuth authentication for automated posting every Sunday.

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 14+ installed
- LinkedIn Developer App created with:
  - **Client ID**: `YOUR_CLIENT_ID`
  - **Client Secret**: `YOUR_CLIENT_SECRET`
- Access to LinkedIn Developer Console

### 2. Installation

```bash
# Install dependencies
npm install

# Or install express manually if needed
npm install express
```

## 📋 LinkedIn App Configuration

### Step 1: Configure Redirect URIs

In your LinkedIn Developer App settings, add these **exact** redirect URIs:

```
https://rsham004.github.io/aibuilders-landing/linkedin-oauth.html
http://localhost:3000/callback
```

### Step 2: Enable Required Products

Make sure these products are enabled in your LinkedIn app:

- ✅ **Sign In with LinkedIn** (provides: `openid`, `profile`)
- ✅ **Share on LinkedIn** (provides: `w_member_social`)

### Step 3: Verify Scopes

Required scopes: `openid profile w_member_social`

## 🔧 OAuth Setup Methods

### Method 1: GitHub Pages (Recommended)

This method uses your existing GitHub Pages site for the OAuth callback.

```bash
# Start interactive setup
npm run linkedin:setup

# Or run directly
node linkedin-oauth.js
```

**Steps:**
1. Choose option 1 (GitHub Pages redirect)
2. Open the provided authorization URL in your browser
3. Complete LinkedIn authorization
4. Copy the authorization code from the callback page
5. Paste it into the terminal when prompted

### Method 2: Local Server

This method runs a local server to handle the OAuth callback automatically.

```bash
# Start local OAuth server
npm run linkedin:server

# Or run directly
node linkedin-oauth.js --server
```

**Steps:**
1. Local server starts at `http://localhost:3000`
2. Open the authorization URL shown in terminal
3. Complete LinkedIn authorization
4. You'll be automatically redirected to the local server
5. Token is captured and saved automatically

### Method 3: Manual Authorization

If the above methods don't work:

```bash
# Get manual authorization URL
node linkedin-oauth.js

# Choose option 3 for manual entry
```

**Steps:**
1. Copy the generated OAuth URL
2. Open it in your browser manually  
3. Complete authorization
4. Copy the `code` parameter from the final URL
5. Enter it in the terminal

## 🧪 Testing Your Setup

### Test API Connection
```bash
# Test if OAuth setup worked
npm run linkedin:test

# Or run directly
node linkedin-posting.js test
```

### Create Test Post
```bash
# Create a weekly community post
npm run linkedin:post

# Or create custom post
node linkedin-posting.js custom "Hello LinkedIn! Testing my automation setup."
```

### Check Recent Posts
```bash
# View recent posts log
node linkedin-posting.js recent
```

## 📁 Generated Files

After successful setup, you'll have these files:

- **`linkedin-tokens.json`** - Contains your access token (expires in 2 months)
- **`linkedin-profile.json`** - Your profile info and Person URN
- **`linkedin-posts-log.json`** - Log of all posts made

⚠️ **Important**: Never commit these files to git. They contain sensitive authentication data.

## 🔄 Automated Posting

### Weekly Posts

The system can generate different types of posts:

1. **Weekly Updates** - Community highlights and statistics
2. **Challenges** - Weekend coding challenges
3. **Success Stories** - Member achievements and projects

### Schedule Setup

To automate Sunday posts, you can:

1. **Add to GitHub Actions** (recommended):
```yaml
name: Weekly LinkedIn Post
on:
  schedule:
    - cron: '0 18 * * 0'  # Every Sunday at 6 PM UTC
jobs:
  post:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: node linkedin-posting.js post
        env:
          LINKEDIN_ACCESS_TOKEN: ${{ secrets.LINKEDIN_ACCESS_TOKEN }}
```

2. **Use cron job** (Linux/Mac):
```bash
# Add to crontab (crontab -e)
0 18 * * 0 cd /path/to/project && node linkedin-posting.js post
```

3. **Use Task Scheduler** (Windows) or similar scheduling tool

## 🛠️ Available Commands

### OAuth Commands
```bash
npm run linkedin:setup          # Interactive OAuth setup
npm run linkedin:server         # Start local OAuth server
node linkedin-oauth.js --status # Check token status
node linkedin-oauth.js --test   # Test existing token
```

### Posting Commands
```bash
npm run linkedin:test                    # Test API connection
npm run linkedin:post                    # Create weekly community post
node linkedin-posting.js profile        # Refresh profile data
node linkedin-posting.js recent         # Show recent posts
node linkedin-posting.js custom "text"  # Create custom post
```

## ❗ Troubleshooting

### Common Issues

#### 1. Redirect URI Mismatch
**Error**: `redirect_uri_mismatch`

**Solution**: 
- Check redirect URI is exactly: `https://rsham004.github.io/aibuilders-landing/linkedin-oauth.html`
- No trailing slashes or extra characters
- Case sensitive

#### 2. Invalid Client
**Error**: `invalid_client`

**Solution**:
- Verify Client ID: `YOUR_CLIENT_ID`
- Check Client Secret is correct
- Ensure app is not in development restrictions

#### 3. Access Denied
**Error**: `access_denied`

**Solution**:
- Check required products are enabled
- Verify scopes: `openid profile w_member_social`
- Make sure app review is completed if required

#### 4. Token Expired
**Error**: Token validation fails

**Solution**:
```bash
# Check token status
node linkedin-oauth.js --status

# If expired, re-run OAuth
npm run linkedin:setup
```

#### 5. Missing Person URN
**Error**: `Person URN not found`

**Solution**:
```bash
# Refresh profile data
node linkedin-posting.js profile
```

### Debug Mode

For detailed error information:

```bash
# Add debug logging
DEBUG=linkedin* node linkedin-oauth.js
DEBUG=linkedin* node linkedin-posting.js test
```

### Manual Token Refresh

LinkedIn access tokens expire after 60 days. To refresh:

```bash
# Check current token status
node linkedin-oauth.js --status

# If expired, run setup again
npm run linkedin:setup
```

## 🔒 Security Best Practices

1. **Never commit sensitive files**:
   ```bash
   # Add to .gitignore
   echo "linkedin-tokens.json" >> .gitignore
   echo "linkedin-profile.json" >> .gitignore
   echo "linkedin-posts-log.json" >> .gitignore
   ```

2. **Use environment variables in production**:
   ```bash
   export LINKEDIN_ACCESS_TOKEN="your_token_here"
   ```

3. **Rotate tokens regularly** (LinkedIn tokens expire in 60 days)

4. **Monitor API usage** to stay within rate limits

## 📊 Rate Limits

LinkedIn API has these limits:
- **Posts**: 250 per day per app
- **Profile requests**: 500 per day per app
- **Throttling**: 100 requests per 10 minutes

For automated posting, this is more than sufficient.

## 🆘 Support

If you encounter issues:

1. **Check this troubleshooting guide**
2. **Verify LinkedIn Developer Console settings**
3. **Test with the simplest method first** (GitHub Pages redirect)
4. **Check LinkedIn API documentation** for any updates
5. **Ensure your LinkedIn app has proper permissions**

## 📝 Example Success Flow

```bash
$ npm run linkedin:setup
LinkedIn OAuth 2.0 Setup - Interactive Mode

Choose your OAuth method:
1. Use GitHub Pages redirect (recommended)
2. Use local server redirect  
3. Manual authorization code entry

Enter your choice (1-3): 1

OAuth Authorization URL:
https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=YOUR_CLIENT_ID...

1. Open the URL above in your browser
2. Complete the LinkedIn authorization
3. You will be redirected with an authorization code
4. Copy the authorization code from the URL or page

Enter the authorization code: AQXxxx...

✅ Access token obtained successfully!
✅ Token saved to linkedin-tokens.json
✅ Profile information retrieved:
✅ Person URN: urn:li:person:xxxxx
✅ Profile information saved to linkedin-profile.json

$ npm run linkedin:test
Testing LinkedIn API Connection
✅ Access token loaded successfully
✅ Connected as: John Doe
✅ Person URN: urn:li:person:xxxxx

$ npm run linkedin:post
Creating Weekly AI Builders Community Post
✅ Post created successfully!
LinkedIn URL: https://www.linkedin.com/feed/update/urn:li:activity:xxxxx
```

## 🎯 Next Steps

After successful setup:

1. **Test posting** with a custom message
2. **Set up automation** using GitHub Actions or cron
3. **Monitor token expiration** (60 days)
4. **Customize post content** in `linkedin-posting.js`
5. **Add error handling** for production use

---

**Ready to automate your LinkedIn posting? Start with `npm run linkedin:setup`! 🚀**