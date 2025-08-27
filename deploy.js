const { execSync } = require('child_process');

async function deployToGitHubPages() {
    console.log('🚀 Deploying AI Builders Landing Page...');
    
    try {
        // Enable GitHub Pages using GitHub CLI
        console.log('📄 Enabling GitHub Pages...');
        const result = execSync(`gh api repos/rsham004/aibuilders-landing/pages -X POST -f source[branch]=master -f source[path]=/`, {
            encoding: 'utf-8',
            stdio: 'pipe'
        });
        
        console.log('✅ GitHub Pages enabled successfully!');
        console.log('🌐 Your site will be available at: https://rsham004.github.io/aibuilders-landing/');
        console.log('⏳ Note: It may take a few minutes for the site to become available.');
        
    } catch (error) {
        if (error.stdout && error.stdout.includes('already exists')) {
            console.log('✅ GitHub Pages is already enabled!');
            console.log('🌐 Your site is available at: https://rsham004.github.io/aibuilders-landing/');
        } else {
            console.error('❌ Error enabling GitHub Pages:', error.message);
            console.log('💡 You can manually enable GitHub Pages in the repository settings:');
            console.log('   1. Go to https://github.com/rsham004/aibuilders-landing/settings/pages');
            console.log('   2. Select "Deploy from a branch"');
            console.log('   3. Choose "master" branch and "/ (root)" folder');
            console.log('   4. Click Save');
        }
    }
}

deployToGitHubPages();