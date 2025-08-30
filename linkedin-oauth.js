#!/usr/bin/env node

/**
 * LinkedIn OAuth 2.0 Token Exchange Script
 * AI Builders Community - Automated LinkedIn Posting Setup
 */

const https = require('https');
const querystring = require('querystring');
const readline = require('readline');
const express = require('express');
const path = require('path');
const fs = require('fs');

// LinkedIn OAuth Configuration
const LINKEDIN_CONFIG = {
    clientId: '86pi8jjap21avr',
    clientSecret: 'WPL_AP1.Fev2G3MXqYbLcZ5', // Note: In production, use environment variables
    redirectUriGitHub: 'https://rsham004.github.io/aibuilders-landing/linkedin-oauth.html',
    redirectUriLocal: 'http://localhost:3000/callback',
    scopes: 'openid profile w_member_social',
    tokenFile: 'linkedin-tokens.json'
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

function logHeader(message) {
    console.log('\n' + '='.repeat(60));
    log(message, 'cyan');
    console.log('='.repeat(60));
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

/**
 * Make HTTPS request
 */
function makeRequest(options, postData = null) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const response = {
                        statusCode: res.statusCode,
                        headers: res.headers,
                        body: data
                    };
                    
                    if (res.statusCode >= 400) {
                        reject(new Error(`HTTP ${res.statusCode}: ${data}`));
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

        if (postData) {
            req.write(postData);
        }

        req.end();
    });
}

/**
 * Exchange authorization code for access token
 */
async function exchangeCodeForToken(code, redirectUri) {
    logInfo('Exchanging authorization code for access token...');
    
    const postData = querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        client_id: LINKEDIN_CONFIG.clientId,
        client_secret: LINKEDIN_CONFIG.clientSecret,
        redirect_uri: redirectUri
    });

    const options = {
        hostname: 'www.linkedin.com',
        port: 443,
        path: '/oauth/v2/accessToken',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    try {
        const response = await makeRequest(options, postData);
        const tokenData = JSON.parse(response.body);
        
        if (tokenData.access_token) {
            logSuccess('Access token obtained successfully!');
            
            // Calculate expiration date
            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + tokenData.expires_in);
            
            const tokenInfo = {
                access_token: tokenData.access_token,
                expires_in: tokenData.expires_in,
                expires_at: expiresAt.toISOString(),
                token_type: tokenData.token_type || 'Bearer',
                scope: tokenData.scope || LINKEDIN_CONFIG.scopes,
                created_at: new Date().toISOString()
            };
            
            // Save token to file
            fs.writeFileSync(LINKEDIN_CONFIG.tokenFile, JSON.stringify(tokenInfo, null, 2));
            logSuccess(`Token saved to ${LINKEDIN_CONFIG.tokenFile}`);
            
            // Get user profile info
            await getUserProfile(tokenInfo.access_token);
            
            return tokenInfo;
        } else {
            throw new Error('No access token in response: ' + JSON.stringify(tokenData));
        }
    } catch (error) {
        logError('Token exchange failed: ' + error.message);
        throw error;
    }
}

/**
 * Get user profile information and Person URN
 */
async function getUserProfile(accessToken) {
    logInfo('Fetching user profile information...');
    
    const options = {
        hostname: 'api.linkedin.com',
        port: 443,
        path: '/v2/people/~',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    };

    try {
        const response = await makeRequest(options);
        const profileData = JSON.parse(response.body);
        
        logSuccess('Profile information retrieved:');
        console.log(JSON.stringify(profileData, null, 2));
        
        if (profileData.id) {
            const personUrn = `urn:li:person:${profileData.id}`;
            logSuccess(`Person URN: ${personUrn}`);
            
            // Save profile info
            const profileInfo = {
                person_urn: personUrn,
                person_id: profileData.id,
                first_name: profileData.localizedFirstName || 'N/A',
                last_name: profileData.localizedLastName || 'N/A',
                profile_data: profileData,
                retrieved_at: new Date().toISOString()
            };
            
            fs.writeFileSync('linkedin-profile.json', JSON.stringify(profileInfo, null, 2));
            logSuccess('Profile information saved to linkedin-profile.json');
            
            return profileInfo;
        } else {
            logWarning('Could not extract Person ID from profile response');
        }
    } catch (error) {
        logError('Failed to get profile: ' + error.message);
        throw error;
    }
}

/**
 * Test the access token by making a simple API call
 */
async function testAccessToken(accessToken) {
    logInfo('Testing access token validity...');
    
    const options = {
        hostname: 'api.linkedin.com',
        port: 443,
        path: '/v2/people/~',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/json'
        }
    };

    try {
        const response = await makeRequest(options);
        const data = JSON.parse(response.body);
        
        if (data.id) {
            logSuccess('Access token is valid!');
            return true;
        } else {
            logError('Access token test failed - invalid response');
            return false;
        }
    } catch (error) {
        logError('Access token test failed: ' + error.message);
        return false;
    }
}

/**
 * Load existing token from file
 */
function loadExistingToken() {
    try {
        if (fs.existsSync(LINKEDIN_CONFIG.tokenFile)) {
            const tokenData = JSON.parse(fs.readFileSync(LINKEDIN_CONFIG.tokenFile, 'utf8'));
            const expiresAt = new Date(tokenData.expires_at);
            const now = new Date();
            
            if (expiresAt > now) {
                logSuccess('Found valid existing token');
                return tokenData;
            } else {
                logWarning('Existing token has expired');
                return null;
            }
        }
        return null;
    } catch (error) {
        logWarning('Could not load existing token: ' + error.message);
        return null;
    }
}

/**
 * Generate OAuth URL
 */
function generateOAuthURL(redirectUri) {
    const state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const params = querystring.stringify({
        response_type: 'code',
        client_id: LINKEDIN_CONFIG.clientId,
        redirect_uri: redirectUri,
        scope: LINKEDIN_CONFIG.scopes,
        state: state
    });
    
    return {
        url: `https://www.linkedin.com/oauth/v2/authorization?${params}`,
        state: state
    };
}

/**
 * Interactive CLI mode
 */
async function interactiveMode() {
    logHeader('LinkedIn OAuth 2.0 Setup - Interactive Mode');
    
    // Check for existing token
    const existingToken = loadExistingToken();
    if (existingToken) {
        logSuccess('Found existing valid token!');
        console.log('\nToken details:');
        console.log(`- Expires: ${existingToken.expires_at}`);
        console.log(`- Scope: ${existingToken.scope}`);
        
        const isValid = await testAccessToken(existingToken.access_token);
        if (isValid) {
            logSuccess('Token is working correctly!');
            return;
        }
    }
    
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    console.log('\nChoose your OAuth method:');
    console.log('1. Use GitHub Pages redirect (recommended)');
    console.log('2. Use local server redirect');
    console.log('3. Manual authorization code entry');
    
    const method = await new Promise((resolve) => {
        rl.question('\nEnter your choice (1-3): ', resolve);
    });
    
    let redirectUri = LINKEDIN_CONFIG.redirectUriGitHub;
    
    switch (method.trim()) {
        case '1':
            redirectUri = LINKEDIN_CONFIG.redirectUriGitHub;
            break;
        case '2':
            redirectUri = LINKEDIN_CONFIG.redirectUriLocal;
            break;
        case '3':
            redirectUri = LINKEDIN_CONFIG.redirectUriGitHub; // Default for manual
            break;
        default:
            logWarning('Invalid choice, using GitHub Pages redirect');
    }
    
    const { url, state } = generateOAuthURL(redirectUri);
    
    console.log('\n' + '='.repeat(80));
    logInfo('OAuth Authorization URL:');
    console.log('\n' + url + '\n');
    console.log('='.repeat(80));
    
    if (method.trim() === '2') {
        logInfo('Starting local server...');
        startLocalServer();
        logInfo('Visit the URL above and complete the authorization.');
        logInfo('The server will automatically capture the authorization code.');
    } else {
        console.log('\n1. Open the URL above in your browser');
        console.log('2. Complete the LinkedIn authorization');
        console.log('3. You will be redirected with an authorization code');
        console.log('4. Copy the authorization code from the URL or page');
        
        const code = await new Promise((resolve) => {
            rl.question('\nEnter the authorization code: ', resolve);
        });
        
        if (code.trim()) {
            try {
                await exchangeCodeForToken(code.trim(), redirectUri);
                logSuccess('OAuth setup completed successfully!');
            } catch (error) {
                logError('OAuth setup failed: ' + error.message);
            }
        } else {
            logError('No authorization code provided');
        }
    }
    
    rl.close();
}

/**
 * Start local server for OAuth callback
 */
function startLocalServer() {
    const app = express();
    const port = 3000;
    
    app.get('/', (req, res) => {
        res.send(`
            <html>
                <head><title>LinkedIn OAuth - Local Server</title></head>
                <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                    <h1>LinkedIn OAuth Setup</h1>
                    <p>Local server is running for OAuth callback.</p>
                    <p>Use this authorization URL:</p>
                    <p><a href="${generateOAuthURL(LINKEDIN_CONFIG.redirectUriLocal).url}" target="_blank">Authorize with LinkedIn</a></p>
                </body>
            </html>
        `);
    });
    
    app.get('/callback', async (req, res) => {
        const { code, error, error_description } = req.query;
        
        if (error) {
            logError(`OAuth Error: ${error} - ${error_description}`);
            res.send(`
                <html>
                    <head><title>OAuth Error</title></head>
                    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                        <h1 style="color: red;">OAuth Error</h1>
                        <p><strong>Error:</strong> ${error}</p>
                        <p><strong>Description:</strong> ${error_description || 'No description provided'}</p>
                        <p>Please check your LinkedIn app configuration and try again.</p>
                    </body>
                </html>
            `);
            return;
        }
        
        if (code) {
            try {
                await exchangeCodeForToken(code, LINKEDIN_CONFIG.redirectUriLocal);
                logSuccess('OAuth completed successfully!');
                
                res.send(`
                    <html>
                        <head><title>OAuth Success</title></head>
                        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                            <h1 style="color: green;">OAuth Success!</h1>
                            <p>Your LinkedIn access token has been obtained and saved.</p>
                            <p>You can now close this window and return to the terminal.</p>
                            <p>The token has been saved to <code>${LINKEDIN_CONFIG.tokenFile}</code></p>
                        </body>
                    </html>
                `);
                
                // Stop the server after a delay
                setTimeout(() => {
                    process.exit(0);
                }, 3000);
                
            } catch (error) {
                logError('Token exchange failed: ' + error.message);
                res.send(`
                    <html>
                        <head><title>OAuth Error</title></head>
                        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px;">
                            <h1 style="color: red;">Token Exchange Failed</h1>
                            <p><strong>Error:</strong> ${error.message}</p>
                            <p>Please check your configuration and try again.</p>
                        </body>
                    </html>
                `);
            }
        }
    });
    
    const server = app.listen(port, () => {
        logSuccess(`Local OAuth server started at http://localhost:${port}`);
        logInfo('Waiting for OAuth callback...');
    });
    
    // Handle server shutdown
    process.on('SIGINT', () => {
        logInfo('Shutting down server...');
        server.close(() => {
            process.exit(0);
        });
    });
}

/**
 * Display current token status
 */
function showTokenStatus() {
    logHeader('LinkedIn Token Status');
    
    const existingToken = loadExistingToken();
    if (!existingToken) {
        logWarning('No token found. Run the script without arguments to set up OAuth.');
        return;
    }
    
    console.log('Current token information:');
    console.log(`- Created: ${existingToken.created_at}`);
    console.log(`- Expires: ${existingToken.expires_at}`);
    console.log(`- Type: ${existingToken.token_type}`);
    console.log(`- Scope: ${existingToken.scope}`);
    
    const expiresAt = new Date(existingToken.expires_at);
    const now = new Date();
    const timeLeft = Math.floor((expiresAt - now) / (1000 * 60 * 60 * 24));
    
    if (timeLeft > 0) {
        logSuccess(`Token is valid for ${timeLeft} more days`);
    } else {
        logError('Token has expired!');
    }
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
LinkedIn OAuth 2.0 Setup Script
Usage: node linkedin-oauth.js [options]

Options:
  --server, -s    Start local OAuth server
  --status        Show current token status
  --test          Test existing access token
  --help, -h      Show this help message

Examples:
  node linkedin-oauth.js              # Interactive setup
  node linkedin-oauth.js --server     # Start local server
  node linkedin-oauth.js --status     # Check token status
  node linkedin-oauth.js --test       # Test current token
        `);
        return;
    }
    
    if (args.includes('--status')) {
        showTokenStatus();
        return;
    }
    
    if (args.includes('--test')) {
        const existingToken = loadExistingToken();
        if (existingToken) {
            await testAccessToken(existingToken.access_token);
        } else {
            logError('No token found to test');
        }
        return;
    }
    
    if (args.includes('--server') || args.includes('-s')) {
        logHeader('LinkedIn OAuth 2.0 Setup - Local Server Mode');
        startLocalServer();
        return;
    }
    
    // Default: interactive mode
    await interactiveMode();
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
    exchangeCodeForToken,
    getUserProfile,
    testAccessToken,
    generateOAuthURL,
    LINKEDIN_CONFIG
};