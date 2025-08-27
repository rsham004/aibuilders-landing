const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const SOURCE_REPO = "AI-Product-Development/wiki";
const TARGET_REPO = "AI-Product-Development/aibuilders";
const CHALLENGES_DIR = "challenges";

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

function extractTitle(content, filename) {
    // Try to find first heading
    const headingMatch = content.match(/^#\s+(.+)$/m);
    if (headingMatch) {
        return headingMatch[1].trim();
    }
    
    // Fallback to filename
    const baseName = path.basename(filename, '.md');
    return baseName
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
}

function createChallengeBody(originalContent, title) {
    return `# 🎯 AI Builder Challenge

${originalContent}

---

## 🤝 How to Participate

1. **💬 Comment below** with your approach or questions
2. **🔗 Share your progress** - link to your repo, demo, or writeup  
3. **🏷️ Tag others** who might be interested in collaborating
4. **⭐ Star this discussion** to follow updates

## 📚 Resources

- 📖 **Source Wiki**: [AI-Product-Development/wiki/challenges](https://github.com/AI-Product-Development/wiki/tree/main/challenges)
- 🏠 **Community Home**: [AI Builders](https://github.com/AI-Product-Development/aibuilders)
- 💡 **More Challenges**: Browse other discussions in this category

---
*This challenge was imported from our community wiki. Feel free to suggest improvements or variations!*`;
}

function getAllMarkdownFiles(dir) {
    const files = [];
    
    function traverse(currentDir) {
        if (!fs.existsSync(currentDir)) return;
        
        const items = fs.readdirSync(currentDir);
        
        for (const item of items) {
            const fullPath = path.join(currentDir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                traverse(fullPath);
            } else if (path.extname(item) === '.md' && /^\d/.test(item)) {
                files.push(fullPath);
            }
        }
    }
    
    traverse(dir);
    return files.sort();
}

async function getChallengesCategoryId() {
    try {
        const query = `query{repository(owner:"AI-Product-Development",name:"aibuilders"){discussionCategories(first:10){nodes{id name}}}}`;
        fs.writeFileSync('temp_query.graphql', query);
        const result = execSync(`gh api graphql --paginate -F query=@temp_query.graphql`, { encoding: 'utf8' });
        fs.unlinkSync('temp_query.graphql');
        const data = JSON.parse(result);
        const categories = data.data.repository.discussionCategories.nodes;
        
        // Look for challenges/collaborations category
        const challengeCategory = categories.find(cat => 
            cat.name.toLowerCase().includes('challenge') || 
            cat.name.toLowerCase().includes('collaboration')
        );
        
        if (challengeCategory) {
            log(`✅ Found category: ${challengeCategory.name} (${challengeCategory.id})`, 'green');
            return challengeCategory.id;
        }
        
        // If not found, show available categories
        log('\nAvailable discussion categories:', 'yellow');
        categories.forEach(cat => {
            log(`  ${cat.id} - ${cat.name}`);
        });
        
        throw new Error('Please manually set the category ID in the script');
    } catch (error) {
        log(`❌ Error getting categories: ${error.message}`, 'red');
        process.exit(1);
    }
}

async function createDiscussion(title, body, categoryId) {
    try {
        // Get repository ID
        const repositoryId = "R_kgDOPjoy2w"; // AI-Product-Development/aibuilders
        
        // Escape special characters for GraphQL
        const escapedTitle = title.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '');
        const escapedBody = body.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '');
        
        const mutation = `mutation { createDiscussion(input: {repositoryId: "${repositoryId}", categoryId: "${categoryId}", title: "${escapedTitle}", body: "${escapedBody}"}) { discussion { id title url } } }`;
        
        fs.writeFileSync('temp_mutation.graphql', mutation);
        const result = execSync(`gh api graphql -F query=@temp_mutation.graphql`, { encoding: 'utf8' });
        fs.unlinkSync('temp_mutation.graphql');
        
        const data = JSON.parse(result);
        return {
            id: data.data.createDiscussion.discussion.id,
            title: data.data.createDiscussion.discussion.title,
            html_url: data.data.createDiscussion.discussion.url
        };
    } catch (error) {
        throw new Error(`Failed to create discussion: ${error.stderr || error.message}`);
    }
}

async function ensureChallengesDirectory() {
    if (fs.existsSync(CHALLENGES_DIR)) {
        return CHALLENGES_DIR;
    }
    
    log('📂 Challenges directory not found locally. Cloning wiki repo...', 'yellow');
    
    try {
        execSync(`gh repo clone ${SOURCE_REPO} temp_wiki`, { stdio: 'inherit' });
        return 'temp_wiki/challenges';
    } catch (error) {
        throw new Error('Failed to clone wiki repository');
    }
}

async function main() {
    log('🚀 Creating AI Builders Challenge Discussions', 'blue');
    log(`Source: ${SOURCE_REPO}/${CHALLENGES_DIR}`, 'blue');
    log(`Target: ${TARGET_REPO}/discussions`, 'blue');
    console.log();
    
    try {
        // Ensure challenges directory exists
        const challengesPath = await ensureChallengesDirectory();
        
        // Get category ID
        const categoryId = await getChallengesCategoryId();
        
        // Get all markdown files
        const markdownFiles = getAllMarkdownFiles(challengesPath);
        log(`\n📁 Found ${markdownFiles.length} markdown files`, 'yellow');
        
        if (markdownFiles.length === 0) {
            log('❌ No markdown files found in challenges directory', 'red');
            process.exit(1);
        }
        
        const results = [];
        
        for (const file of markdownFiles) {
            try {
                const fileName = path.basename(file);
                log(`\n📄 Processing: ${fileName}`, 'blue');
                
                const content = fs.readFileSync(file, 'utf8');
                let title = extractTitle(content, file);
                
                // Add challenge prefix if not already present
                if (!title.match(/^(Challenge|🎯)/)) {
                    title = `🎯 Challenge: ${title}`;
                }
                
                log(`   📝 Title: "${title}"`);
                
                const discussionBody = createChallengeBody(content, title);
                
                log('   🔄 Creating discussion...');
                const discussion = await createDiscussion(title, discussionBody, categoryId);
                
                log(`   ✅ Created: ${discussion.html_url}`, 'green');
                
                results.push({
                    file: fileName,
                    title,
                    url: discussion.html_url,
                    success: true
                });
                
                // Rate limiting delay
                await new Promise(resolve => setTimeout(resolve, 2000));
                
            } catch (error) {
                log(`   ❌ Failed: ${error.message}`, 'red');
                results.push({
                    file: path.basename(file),
                    title: 'Failed to extract',
                    error: error.message,
                    success: false
                });
            }
        }
        
        // Summary
        const successful = results.filter(r => r.success);
        const failed = results.filter(r => !r.success);
        
        console.log('\n🎉 Summary:', 'green');
        log(`   ✅ Successfully created: ${successful.length} discussions`, 'green');
        if (failed.length > 0) {
            log(`   ❌ Failed: ${failed.length} discussions`, 'red');
        }
        
        // Save results
        const resultsFile = 'aibuilders-discussions-results.json';
        fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
        log(`\n📁 Results saved to: ${resultsFile}`);
        
        // Display successful creations
        if (successful.length > 0) {
            log('\n🔗 Created Discussions:', 'blue');
            successful.forEach(result => {
                log(`   • ${result.title}: ${result.url}`);
            });
            
            // Save URLs to text file for easy access
            const urls = successful.map(r => r.url).join('\n');
            fs.writeFileSync('created-discussions.txt', urls);
        }
        
        // Cleanup
        if (fs.existsSync('temp_wiki')) {
            log('\n🧹 Cleaning up temporary files...', 'yellow');
            fs.rmSync('temp_wiki', { recursive: true });
        }
        
        log('\n🎯 Next Steps:', 'blue');
        log(`   1. Visit your discussions: https://github.com/${TARGET_REPO}/discussions`);
        log('   2. Pin important challenges');
        log('   3. Engage with the community!');
        log('✨ Happy building!', 'green');
        
    } catch (error) {
        log(`❌ Script failed: ${error.message}`, 'red');
        process.exit(1);
    }
}

main();