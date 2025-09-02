// Script to get formatted Instagram content for manual posting
const fs = require('fs');
const path = require('path');

// Configuration
const POSTS_DIR = "marketing/posts";

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

function getInstagramContent() {
    const postDir = path.join(POSTS_DIR, 'ai-builders-community');
    const instagramContentPath = path.join(postDir, 'instagram-content.md');
    const contentPath = path.join(postDir, 'content.md');
    
    let contentFile = instagramContentPath;
    if (!fs.existsSync(instagramContentPath)) {
        contentFile = contentPath;
        if (!fs.existsSync(contentPath)) {
            console.log('❌ No content file found');
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
    
    return instagramPost;
}

// Main execution
console.log('📱 Instagram Content Generator');
console.log('================================');
console.log();

const content = getInstagramContent();

if (content) {
    console.log('📝 CONTENT FOR INSTAGRAM POST:');
    console.log();
    console.log('--- COPY BELOW ---');
    console.log(content);
    console.log('--- COPY ABOVE ---');
    console.log();
    console.log('💡 Instructions:');
    console.log('1. Copy the content above');
    console.log('2. Open Instagram app or web');
    console.log('3. Create new post/story');
    console.log('4. Paste the content');
    console.log('5. Add any images if desired');
    console.log('6. Post!');
    console.log();
    console.log('📊 Character count:', content.length);
    
    if (content.length > 2200) {
        console.log('⚠️  Content is long - may need trimming for Instagram');
    }
} else {
    console.log('❌ Could not generate content. Check file paths.');
}