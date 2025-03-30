/**
 * Script to deploy the application to GitHub Pages
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to run shell commands
function run(command) {
  console.log(`Executing: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    return false;
  }
}

// Main function
async function deploy() {
  console.log('🚀 Preparing to deploy to GitHub Pages...');
  
  // Check if git is initialized
  if (!fs.existsSync('.git')) {
    console.log('No Git repository found. Initializing...');
    run('git init');
  }
  
  // Ask for GitHub repository details if needed
  let repoUrl = '';
  try {
    repoUrl = execSync('git config --get remote.origin.url').toString().trim();
    console.log(`Found GitHub repository: ${repoUrl}`);
  } catch (error) {
    await new Promise((resolve) => {
      rl.question('Enter your GitHub repository URL (e.g., https://github.com/username/repo.git): ', (answer) => {
        repoUrl = answer.trim();
        resolve();
      });
    });
    
    if (!repoUrl) {
      console.error('❌ No GitHub repository URL provided. Aborting deployment.');
      process.exit(1);
    }
    
    // Add the remote origin
    run(`git remote add origin ${repoUrl}`);
  }
  
  // Extract the repository name for the base path
  let repoName = '';
  if (repoUrl.includes('github.com')) {
    repoName = repoUrl.split('/').pop().replace('.git', '');
  }
  
  // Build the static site with the repository name as the base path
  console.log(`\n🏗️ Building static site for GitHub Pages with base path /${repoName}/...`);
  process.env.GITHUB_REPOSITORY = `username/${repoName}`;  // This is used in vite.config.static.ts
  
  if (!run('node build-gh-pages.js')) {
    console.error('❌ Build failed. Please check the errors above.');
    process.exit(1);
  }
  
  // Deploy to GitHub Pages
  console.log('\n📤 Deploying to GitHub Pages...');
  if (!run('npx gh-pages -d dist/public')) {
    console.error('❌ Deployment failed. Please check the errors above.');
    process.exit(1);
  }
  
  console.log('\n✅ Deployment successful!');
  console.log(`Your site will be available at: https://<your-username>.github.io/${repoName}/`);
  console.log('Note: It may take a few minutes for the changes to propagate.');
  
  rl.close();
}

// Run the deployment
deploy().catch(error => {
  console.error('Deployment error:', error);
  process.exit(1);
});