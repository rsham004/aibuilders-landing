#!/usr/bin/env node

/**
 * LinkedIn Posting Utility
 * AI Builders Community - Automated LinkedIn Posting
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// LinkedIn API Configuration
const LINKEDIN_CONFIG = {
    tokenFile: 'linkedin-tokens.json',
    profileFile: 'linkedin-profile.json',
    postsLogFile: 'linkedin-posts-log.json'
};

// ANSI color codes for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

function logSuccess(message) {
    log('✅ ' + message, 'green');
}

function logError(message) {
    log('❌ ' + message, 'red');
}

function logWarning(message) {
    log('⚠️  ' + message, 'yellow');
}

function logInfo(message) {
    log('ℹ️  ' + message, 'blue');
}

function logHeader(message) {
    console.log('\n' + '='.repeat(60));
    log(message, 'cyan');
    console.log('='.repeat(60));
}

/**
 * Load access token from file
 */
function loadAccessToken() {
    try {
        if (!fs.existsSync(LINKEDIN_CONFIG.tokenFile)) {
            throw new Error('Token file not found. Run "node linkedin-oauth.js" first to set up authentication.');
        }
        
        const tokenData = JSON.parse(fs.readFileSync(LINKEDIN_CONFIG.tokenFile, 'utf8'));
        const expiresAt = new Date(tokenData.expires_at);
        const now = new Date();
        
        if (expiresAt <= now) {
            throw new Error('Access token has expired. Run "node linkedin-oauth.js" to refresh.');
        }
        
        return tokenData.access_token;
    } catch (error) {
        throw new Error(`Failed to load access token: ${error.message}`);
    }
}

/**
 * Load Person URN from profile file
 */
function loadPersonURN() {
    try {
        if (!fs.existsSync(LINKEDIN_CONFIG.profileFile)) {
            throw new Error('Profile file not found. The OAuth process should have created this file.');
        }
        
        const profileData = JSON.parse(fs.readFileSync(LINKEDIN_CONFIG.profileFile, 'utf8'));
        
        if (!profileData.person_urn) {
            throw new Error('Person URN not found in profile data.');
        }
        
        return profileData.person_urn;
    } catch (error) {
        throw new Error(`Failed to load Person URN: ${error.message}`);
    }
}

/**
 * Make HTTPS request to LinkedIn API
 */
function makeLinkedInRequest(path, method = 'GET', data = null, accessToken) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'api.linkedin.com',
            port: 443,
            path: path,
            method: method,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'LinkedIn-Version': '202408'
            }
        };
        
        if (data && method !== 'GET') {
            const jsonData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(jsonData);
        }
        
        const req = https.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: responseData
                    };
                    
                    if (res.statusCode >= 400) {
                        reject(new Error(`LinkedIn API Error ${res.statusCode}: ${responseData}`));
                    } else {
                        resolve(response);
                    }
                } catch (error) {
                    reject(error);
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (data && method !== 'GET') {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

/**
 * Get user profile information
 */
async function getUserProfile(accessToken) {
    logInfo('Fetching user profile...');
    
    try {
        const response = await makeLinkedInRequest('/v2/people/~', 'GET', null, accessToken);
        const profileData = JSON.parse(response.body);
        
        logSuccess('Profile retrieved successfully');
        
        const personUrn = `urn:li:person:${profileData.id}`;
        
        const profileInfo = {
            person_urn: personUrn,
            person_id: profileData.id,
            first_name: profileData.localizedFirstName || 'N/A',
            last_name: profileData.localizedLastName || 'N/A',
            profile_data: profileData,
            retrieved_at: new Date().toISOString()
        };
        
        // Save profile info
        fs.writeFileSync(LINKEDIN_CONFIG.profileFile, JSON.stringify(profileInfo, null, 2));
        logSuccess(`Profile saved to ${LINKEDIN_CONFIG.profileFile}`);
        
        return profileInfo;
    } catch (error) {
        logError(`Failed to get profile: ${error.message}`);
        throw error;
    }
}

/**
 * Create a LinkedIn post
 */
async function createPost(postContent, accessToken, personUrn) {
    logInfo('Creating LinkedIn post...');
    
    const postData = {
        author: personUrn,
        lifecycleState: 'PUBLISHED',
        specificContent: {
            'com.linkedin.ugc.ShareContent': {
                shareCommentary: {
                    text: postContent
                },
                shareMediaCategory: 'NONE'
            }
        },
        visibility: {
            'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
        }
    };
    
    try {
        const response = await makeLinkedInRequest('/v2/ugcPosts', 'POST', postData, accessToken);
        const result = JSON.parse(response.body);
        
        logSuccess('Post created successfully!');
        
        // Log the post
        const postLog = {
            id: result.id,
            content: postContent,
            created_at: new Date().toISOString(),
            linkedin_url: `https://www.linkedin.com/feed/update/${result.id}`,
            response: result
        };
        
        // Save to posts log
        let postsLog = [];
        if (fs.existsSync(LINKEDIN_CONFIG.postsLogFile)) {
            postsLog = JSON.parse(fs.readFileSync(LINKEDIN_CONFIG.postsLogFile, 'utf8'));
        }
        postsLog.push(postLog);
        fs.writeFileSync(LINKEDIN_CONFIG.postsLogFile, JSON.stringify(postsLog, null, 2));
        
        return result;
    } catch (error) {
        logError(`Failed to create post: ${error.message}`);
        throw error;
    }
}

/**
 * Generate AI Builders Community post content
 */
function generateCommunityPost() {
    const posts = [
        {
            content: `🚀 This week in the AI Builders Community:

📚 New learning pathways published
💡 5 innovative AI projects shared
🤝 20+ developers collaborated on challenges
📈 Growing stronger together!

Join us for hands-on AI learning and real-world project development.

#AIBuilders #ArtificialIntelligence #CommunityLearning #AIEducation #TechCommunity`,
            type: 'weekly_update'
        },
        {
            content: `🔥 Weekend AI Challenge Alert! 

This week's challenge: Build an AI-powered content analyzer using Claude Code.

What you'll learn:
✅ API integration patterns
✅ Natural language processing
✅ Real-time data analysis
✅ Community collaboration

Ready to level up your AI skills? Join the AI Builders Community!

#WeekendChallenge #AIBuilders #CodingChallenge #ArtificialIntelligence #LearnAI`,
            type: 'challenge'
        },
        {
            content: `💡 AI Builder Spotlight: Success Stories

Our community members are shipping incredible AI products:
• Automated content generation tools
• Smart data analysis dashboards  
• Intelligent chat assistants
• Custom AI workflows

Your next breakthrough could be one conversation away.

Join the AI Builders Community today! 🌟

#AISuccess #CommunitySpotlight #AIBuilders #ProductDevelopment #Innovation`,
            type: 'success_stories'
        }
    ];
    
    // Return a random post
    return posts[Math.floor(Math.random() * posts.length)];
}

/**
 * Create weekly community post
 */
async function createWeeklyCommunityPost() {
    logHeader('Creating Weekly AI Builders Community Post');
    
    try {
        const accessToken = loadAccessToken();
        const personUrn = loadPersonURN();
        
        const postData = generateCommunityPost();
        logInfo(`Post type: ${postData.type}`);
        console.log('\nPost content:');
        console.log('=' + '='.repeat(50));
        console.log(postData.content);
        console.log('=' + '='.repeat(50));
        
        const result = await createPost(postData.content, accessToken, personUrn);
        
        logSuccess('Weekly community post published successfully!');
        console.log(`LinkedIn URL: https://www.linkedin.com/feed/update/${result.id}`);
        
        return result;
    } catch (error) {
        logError(`Failed to create weekly post: ${error.message}`);
        throw error;
    }
}

/**
 * Test LinkedIn API connection
 */
async function testConnection() {
    logHeader('Testing LinkedIn API Connection');
    
    try {
        const accessToken = loadAccessToken();
        logSuccess('Access token loaded successfully');
        
        const profile = await getUserProfile(accessToken);
        logSuccess(`Connected as: ${profile.first_name} ${profile.last_name}`);
        logInfo(`Person URN: ${profile.person_urn}`);
        
        return true;
    } catch (error) {
        logError(`Connection test failed: ${error.message}`);
        return false;
    }
}

/**
 * Show recent posts
 */
function showRecentPosts() {
    logHeader('Recent LinkedIn Posts');
    
    if (!fs.existsSync(LINKEDIN_CONFIG.postsLogFile)) {
        logWarning('No posts log found. No posts have been made yet.');
        return;
    }
    
    try {
        const postsLog = JSON.parse(fs.readFileSync(LINKEDIN_CONFIG.postsLogFile, 'utf8'));
        
        if (postsLog.length === 0) {
            logWarning('No posts found in the log.');
            return;
        }
        
        const recentPosts = postsLog.slice(-5).reverse(); // Last 5 posts, most recent first
        
        recentPosts.forEach((post, index) => {
            console.log(`\n${index + 1}. Post ID: ${post.id}`);
            console.log(`   Date: ${new Date(post.created_at).toLocaleDateString()}`);
            console.log(`   URL: ${post.linkedin_url}`);
            console.log(`   Content preview: ${post.content.substring(0, 100)}...`);
        });
        
        logInfo(`Showing ${recentPosts.length} most recent posts (${postsLog.length} total)`);
    } catch (error) {
        logError(`Failed to show recent posts: ${error.message}`);
    }
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
LinkedIn Posting Utility
Usage: node linkedin-posting.js [command]

Commands:
  test              Test LinkedIn API connection
  post              Create a weekly community post  
  profile           Get and save user profile
  recent            Show recent posts
  custom <text>     Create a custom post with provided text
  
Examples:
  node linkedin-posting.js test
  node linkedin-posting.js post
  node linkedin-posting.js custom "Hello LinkedIn! This is a custom post."
  node linkedin-posting.js recent
        `);
        return;
    }
    
    const command = args[0] || 'test';
    
    switch (command) {
        case 'test':
            await testConnection();
            break;
            
        case 'post':
            await createWeeklyCommunityPost();
            break;
            
        case 'profile':
            try {
                const accessToken = loadAccessToken();
                await getUserProfile(accessToken);
            } catch (error) {
                logError(`Profile command failed: ${error.message}`);
            }
            break;
            
        case 'recent':
            showRecentPosts();
            break;
            
        case 'custom':
            if (args.length < 2) {
                logError('Custom post requires text. Usage: node linkedin-posting.js custom "Your post text"');
                break;
            }
            try {
                const accessToken = loadAccessToken();
                const personUrn = loadPersonURN();
                const postText = args.slice(1).join(' ');
                
                console.log('\nPost content:');
                console.log('=' + '='.repeat(50));
                console.log(postText);
                console.log('=' + '='.repeat(50));
                
                const result = await createPost(postText, accessToken, personUrn);
                logSuccess('Custom post published successfully!');
                console.log(`LinkedIn URL: https://www.linkedin.com/feed/update/${result.id}`);
            } catch (error) {
                logError(`Custom post failed: ${error.message}`);
            }
            break;
            
        default:
            logError(`Unknown command: ${command}`);
            logInfo('Use --help to see available commands');
    }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Run the script
if (require.main === module) {
    main().catch((error) => {
        logError('Script failed: ' + error.message);
        process.exit(1);
    });
}

module.exports = {
    createPost,
    getUserProfile,
    testConnection,
    generateCommunityPost,
    loadAccessToken,
    loadPersonURN
};