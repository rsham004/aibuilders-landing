const fs = require('fs');
const path = require('path');

// Load environment variables from .env file if it exists
if (fs.existsSync('.env')) {
    require('dotenv').config();
}

// Configuration
const POSTS_DIR = "marketing/posts";
const INSTAGRAM_LOG_FILE = "instagram-posting-log.json";

// Helper functions
function log(message, color = '') {
    const colors = {
        green: '\x1b[32m',
        red: '\x1b[31m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        reset: '\x1b[0m'
    };
    console.log(`${colors[color] || ''}${message}${colors.reset}`);
}

function getInstagramPostingLog() {
    try {
        if (fs.existsSync(INSTAGRAM_LOG_FILE)) {
            return JSON.parse(fs.readFileSync(INSTAGRAM_LOG_FILE, 'utf-8'));
        }
        return { posts: {} };
    } catch (error) {
        log(`⚠️  Error reading Instagram posting log: ${error.message}`, 'yellow');
        return { posts: {} };
    }
}

function saveInstagramPostingLog(log_data) {
    try {
        fs.writeFileSync(INSTAGRAM_LOG_FILE, JSON.stringify(log_data, null, 2));
        log('💾 Updated Instagram posting log', 'blue');
    } catch (error) {
        log(`❌ Error saving Instagram posting log: ${error.message}`, 'red');
    }
}

function parseMarkdownContent(content) {
    const lines = content.split('\n');
    let mainContent = '';
    let hashtags = '';
    let callToAction = '';
    let currentSection = '';
    
    for (const line of lines) {
        if (line.startsWith('## Main Content')) {
            currentSection = 'main';
            continue;
        } else if (line.startsWith('## Hashtags')) {
            currentSection = 'hashtags';
            continue;
        } else if (line.startsWith('## Call to Action')) {
            currentSection = 'cta';
            continue;
        } else if (line.startsWith('#') || line.trim() === '') {
            continue;
        }
        
        if (currentSection === 'main') {
            mainContent += line + '\n';
        } else if (currentSection === 'hashtags') {
            hashtags += line + '\n';
        } else if (currentSection === 'cta') {
            callToAction += line + '\n';
        }
    }
    
    return {
        main: mainContent.trim(),
        hashtags: hashtags.trim(),
        cta: callToAction.trim()
    };
}

function shouldPostToday(config, lastPosted) {
    if (!config.schedule) return true;
    
    const now = new Date();
    const today = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Map day names to numbers
    const dayMap = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6
    };
    
    const scheduledDay = dayMap[config.schedule.day_of_week?.toLowerCase()];
    
    if (scheduledDay !== undefined && today !== scheduledDay) {
        return false;
    }
    
    // Check if already posted today
    if (lastPosted) {
        const lastPostDate = new Date(lastPosted);
        const todayDate = now.toDateString();
        if (lastPostDate.toDateString() === todayDate) {
            return false;
        }
    }
    
    return true;
}

async function postToInstagram(postContent) {
    const { IgApiClient } = require('instagram-private-api');
    const ig = new IgApiClient();
    
    try {
        const username = process.env.INSTAGRAM_USERNAME;
        const password = process.env.INSTAGRAM_PASSWORD;
        
        if (!username || !password) {
            throw new Error('Instagram credentials not found. Please set INSTAGRAM_USERNAME and INSTAGRAM_PASSWORD environment variables.');
        }
        
        log('🔐 Setting up Instagram client...', 'yellow');
        
        // Generate a more realistic device
        ig.state.generateDevice(username);
        
        // Set proxy agent to avoid user agent issues
        ig.request.defaults.headers = {
            'User-Agent': 'Instagram 219.0.0.12.117 Android',
            'Accept-Language': 'en-US',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'close',
            'X-IG-Capabilities': '3brTv10=',
            'X-IG-Connection-Type': 'WIFI',
            'Host': 'i.instagram.com'
        };
        
        log('🔐 Attempting Instagram login...', 'yellow');
        await ig.account.login(username, password);
        
        log('📱 Posting to Instagram Story...', 'blue');
        
        // Create story with text content
        const storyResult = await ig.publish.story({
            text: postContent,
        });
        
        log('✅ Successfully posted to Instagram story!', 'green');
        log(`Story ID: ${storyResult.media.pk}`, 'blue');
        
        return {
            success: true,
            type: 'story',
            id: storyResult.media.pk,
            platform: 'instagram'
        };
        
    } catch (error) {
        log(`❌ Error posting to Instagram: ${error.message}`, 'red');
        
        if (error.message.includes('challenge_required')) {
            log('🔒 Instagram requires verification. This is normal for new locations/devices.', 'yellow');
            log('💡 The automated posting may work better over time as Instagram recognizes the pattern.', 'yellow');
        }
        
        return {
            success: false,
            error: error.message,
            platform: 'instagram'
        };
    }
}

async function processPost(postDir) {
    const configPath = path.join(postDir, 'config.json');
    const instagramContentPath = path.join(postDir, 'instagram-content.md');
    const contentPath = path.join(postDir, 'content.md');
    
    if (!fs.existsSync(configPath)) {
        log(`⚠️  No config.json found in ${postDir}`, 'yellow');
        return null;
    }
    
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    // Check if Instagram is enabled for this post
    if (!config.platforms.includes('instagram')) {
        log(`⏭️  Instagram not enabled for ${config.post_id}`, 'blue');
        return null;
    }
    
    if (!config.active) {
        log(`⏭️  Post ${config.post_id} is not active`, 'blue');
        return null;
    }
    
    // Get posting log
    const postingLog = getInstagramPostingLog();
    const lastPosted = postingLog.posts[config.post_id]?.last_posted;
    
    // Check if should post today
    if (!shouldPostToday(config, lastPosted)) {
        log(`⏭️  Not scheduled to post ${config.post_id} today`, 'blue');
        return null;
    }
    
    // Read content file (prefer Instagram-specific content)
    let contentFile = instagramContentPath;
    if (!fs.existsSync(instagramContentPath)) {
        contentFile = contentPath;
        if (!fs.existsSync(contentPath)) {
            log(`❌ No content file found for ${config.post_id}`, 'red');
            return null;
        }
    }
    
    const content = fs.readFileSync(contentFile, 'utf-8');
    const parsedContent = parseMarkdownContent(content);
    
    // Format for Instagram
    let instagramPost = parsedContent.main;
    
    if (parsedContent.cta) {
        instagramPost += '\n\n' + parsedContent.cta;
    }
    
    if (parsedContent.hashtags) {
        instagramPost += '\n\n' + parsedContent.hashtags;
    }
    
    log(`📝 Posting "${config.title}"`, 'blue');
    log(`📝 Content preview: ${instagramPost.substring(0, 100)}...`, 'yellow');
    
    const result = await postToInstagram(instagramPost);
    
    if (result.success) {
        // Update posting log
        if (!postingLog.posts[config.post_id]) {
            postingLog.posts[config.post_id] = {};
        }
        
        postingLog.posts[config.post_id] = {
            last_posted: new Date().toISOString(),
            last_post_id: result.id,
            post_type: result.type,
            platform: result.platform,
            title: config.title
        };
        
        saveInstagramPostingLog(postingLog);
        log(`✅ Successfully posted ${config.post_id} to Instagram`, 'green');
    }
    
    return result;
}

async function main() {
    try {
        log('📸 Starting Instagram posting process...', 'blue');
        
        if (!fs.existsSync(POSTS_DIR)) {
            log(`❌ Posts directory not found: ${POSTS_DIR}`, 'red');
            return;
        }
        
        const postDirs = fs.readdirSync(POSTS_DIR)
            .filter(item => fs.statSync(path.join(POSTS_DIR, item)).isDirectory())
            .map(item => path.join(POSTS_DIR, item));
        
        log(`📁 Found ${postDirs.length} post directories`, 'blue');
        
        let postsProcessed = 0;
        let postsSuccessful = 0;
        
        for (const postDir of postDirs) {
            const result = await processPost(postDir);
            if (result !== null) {
                postsProcessed++;
                if (result.success) {
                    postsSuccessful++;
                }
            }
        }
        
        log(`📊 Processed ${postsProcessed} posts, ${postsSuccessful} successful`, 'green');
        
    } catch (error) {
        log(`❌ Error in main process: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = { main, processPost };