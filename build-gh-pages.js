/**
 * Script to build a GitHub Pages static version of the site
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to run shell commands
function run(command) {
  console.log(`Executing: ${command}`);
  try {
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
}

// Create a dist directory if it doesn't exist
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

// Build the static site
console.log('Building static site for GitHub Pages...');
run('vite build --config vite.config.static.ts');

// Create an index.html in the root for GitHub Pages
console.log('Creating a GitHub Pages 404.html for SPA routing...');
const publicDir = path.join(__dirname, 'dist', 'public');
const indexHtml = fs.readFileSync(path.join(publicDir, 'index.html'), 'utf8');
fs.writeFileSync(path.join(publicDir, '404.html'), indexHtml);

console.log('Build complete! The static site is ready in dist/public/');
console.log('------------------------------------------------------');
console.log('To deploy to GitHub Pages:');
console.log('1. Create a GitHub repository for your project');
console.log('2. Deploy the static site: npx gh-pages -d dist/public');
console.log('------------------------------------------------------');