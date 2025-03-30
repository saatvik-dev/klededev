#!/usr/bin/env node

/**
 * This script helps with deploying to Netlify
 * It checks for required environment variables and provides guidance
 */

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🚀 Klede Waitlist - Netlify Deployment Helper\n');

// Check if Netlify CLI is installed
try {
  execSync('netlify --version', { stdio: 'ignore' });
  console.log('✅ Netlify CLI is installed');
} catch (error) {
  console.log('❌ Netlify CLI is not installed. Please install it with:');
  console.log('   npm i -g netlify-cli');
  process.exit(1);
}

// Create netlify.toml if it doesn't exist
const netlifyConfigPath = path.join(__dirname, 'netlify.toml');
if (!fs.existsSync(netlifyConfigPath)) {
  console.log('Creating netlify.toml configuration file...');
  const netlifyConfig = `[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/api/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
`;
  fs.writeFileSync(netlifyConfigPath, netlifyConfig);
  console.log('✅ netlify.toml created');
}

// Ensure netlify/functions directory exists
const functionsDir = path.join(__dirname, 'netlify', 'functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
  console.log('✅ netlify/functions directory created');
}

// Create API function file
const apiFunctionPath = path.join(functionsDir, 'api.js');
if (!fs.existsSync(apiFunctionPath)) {
  const apiFunction = `// Netlify serverless function handler for API routes
const { createServer } = require('../../dist/server');
const serverless = require('serverless-http');

// Create server for serverless environment
exports.handler = async (event, context) => {
  const { app } = await createServer({ serverless: true });
  const handler = serverless(app);
  return handler(event, context);
};
`;
  fs.writeFileSync(apiFunctionPath, apiFunction);
  console.log('✅ api.js serverless function created');
}

console.log('\n🔍 Checking deployment prerequisites...\n');

// Ask for database URL
rl.question('Do you have a PostgreSQL database URL ready? (y/n): ', (hasDbUrl) => {
  if (hasDbUrl.toLowerCase() !== 'y') {
    console.log('\n⚠️ You need a PostgreSQL database URL for deployment.');
    console.log('   You can get one from:');
    console.log('   - Neon: https://neon.tech');
    console.log('   - Supabase: https://supabase.com');
    console.log('   - Render: https://render.com/docs/databases');
    console.log('\n   Please set up a database and come back with the connection string.');
    rl.close();
    process.exit(0);
  }
  
  // Ask for session secret
  rl.question('Do you have a session secret ready? (y/n): ', (hasSessionSecret) => {
    if (hasSessionSecret.toLowerCase() !== 'y') {
      console.log('\n⚠️ You need a secure random string for SESSION_SECRET.');
      console.log('   You can generate one at: https://1password.com/password-generator/');
      console.log('\n   Please generate a secure string and come back.');
      rl.close();
      process.exit(0);
    }
    
    console.log('\n✅ Great! You have all the prerequisites ready.');
    console.log('\nTo deploy your application to Netlify, run:');
    console.log('   netlify deploy');
    console.log('\nWhen prompted, choose "Create & configure a new site"');
    console.log('\nAfter initial deployment, set your environment variables:');
    console.log('   netlify env:set DATABASE_URL "your_database_url"');
    console.log('   netlify env:set SESSION_SECRET "your_secure_session_secret"');
    console.log('\nThen deploy to production:');
    console.log('   netlify deploy --prod');
    console.log('\nAfter deployment, set up your database schema:');
    console.log('   npm run db:push');
    console.log('\nGood luck with your Netlify deployment! 🎉');
    
    rl.close();
  });
});