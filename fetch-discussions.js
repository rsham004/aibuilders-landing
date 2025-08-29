const fs = require('fs');
const { execSync } = require('child_process');

// Configuration
const TARGET_REPO = "AI-Product-Development/aibuilders";
const OUTPUT_FILE = "aibuilders-discussions-results.json";

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

async function fetchDiscussions() {
    try {
        log('🔍 Fetching AI Builders Discussions...', 'blue');
        log(`Source: ${TARGET_REPO}/discussions`, 'blue');
        
        // Fetch discussions using GitHub CLI
        const command = `gh api repos/${TARGET_REPO}/discussions --paginate --jq '.[] | {title: .title, url: .html_url, number: .number, category: .category.name, created_at: .created_at, updated_at: .updated_at, comments: .comments, user: .user.login, body: .body}'`;
        
        log('📡 Fetching discussions data...', 'yellow');
        const result = execSync(command, { 
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        
        // Parse the results
        const discussions = result.trim().split('\n')
            .filter(line => line.trim())
            .map(line => JSON.parse(line));
        
        log(`✅ Found ${discussions.length} discussions`, 'green');
        
        // Save to JSON file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(discussions, null, 2));
        log(`💾 Saved to ${OUTPUT_FILE}`, 'green');
        
        // Display summary
        const categories = [...new Set(discussions.map(d => d.category))];
        log(`📊 Categories: ${categories.join(', ')}`, 'blue');
        
        return discussions;
        
    } catch (error) {
        log(`❌ Error fetching discussions: ${error.message}`, 'red');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    fetchDiscussions();
}

module.exports = { fetchDiscussions };