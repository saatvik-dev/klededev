#!/usr/bin/env node

/**
 * This script helps with deploying to Vercel
 * It checks for required environment variables and provides guidance
 */

const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n🚀 Klede Waitlist - Vercel Deployment Helper\n');

// Check if Vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
  console.log('✅ Vercel CLI is installed');
} catch (error) {
  console.log('❌ Vercel CLI is not installed. Please install it with:');
  console.log('   npm i -g vercel');
  process.exit(1);
}

console.log('\n🔍 Checking deployment prerequisites...\n');

// Ask for database URL
rl.question('Do you have a PostgreSQL database URL ready? (y/n): ', (hasDbUrl) => {
  if (hasDbUrl.toLowerCase() !== 'y') {
    console.log('\n⚠️ You need a PostgreSQL database URL for deployment.');
    console.log('   You can get one from:');
    console.log('   - Neon: https://neon.tech');
    console.log('   - Supabase: https://supabase.com');
    console.log('   - Vercel Postgres: https://vercel.com/storage/postgres');
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
    console.log('\nTo deploy your application to Vercel, run:');
    console.log('   vercel');
    console.log('\nWhen prompted, enter your DATABASE_URL and SESSION_SECRET.');
    console.log('\nAfter deployment completes, run:');
    console.log('   vercel env pull');
    console.log('   npm run db:push');
    console.log('\nThis will set up your database schema.');
    console.log('\nGood luck with your deployment! 🎉');
    
    rl.close();
  });
});