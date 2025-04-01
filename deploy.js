/**
 * This script helps with deploying to Vercel and Netlify
 * It checks for required environment variables and provides guidance
 */

const fs = require('fs');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ANSI color codes for prettier output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function printHeader() {
  console.log(`
${colors.bright}${colors.blue}=================================================
${colors.green}            KLEDE DEPLOYMENT HELPER
${colors.blue}=================================================
${colors.reset}

This script will help you deploy your Klede application to:
- Backend: ${colors.cyan}Vercel${colors.reset}
- Frontend: ${colors.cyan}Netlify${colors.reset}

It will check your configuration and guide you through the process.
`);
}

function checkEnvironment() {
  console.log(`${colors.bright}Checking environment...${colors.reset}\n`);
  
  let allGood = true;
  
  // Check for required files in the backend directory
  if (!fs.existsSync('./backend/server/index.ts')) {
    console.log(`${colors.red}✖ Missing backend/server/index.ts${colors.reset}`);
    allGood = false;
  } else {
    console.log(`${colors.green}✓ Found backend/server/index.ts${colors.reset}`);
  }
  
  if (!fs.existsSync('./backend/vercel.json')) {
    console.log(`${colors.red}✖ Missing backend/vercel.json${colors.reset}`);
    allGood = false;
  } else {
    console.log(`${colors.green}✓ Found backend/vercel.json${colors.reset}`);
  }
  
  // Check for required files in the frontend directory
  if (!fs.existsSync('./frontend/src')) {
    console.log(`${colors.red}✖ Missing frontend/src directory${colors.reset}`);
    allGood = false;
  } else {
    console.log(`${colors.green}✓ Found frontend/src directory${colors.reset}`);
  }
  
  if (!fs.existsSync('./frontend/netlify.toml')) {
    console.log(`${colors.red}✖ Missing frontend/netlify.toml${colors.reset}`);
    allGood = false;
  } else {
    console.log(`${colors.green}✓ Found frontend/netlify.toml${colors.reset}`);
  }
  
  // Check for build scripts
  if (!fs.existsSync('./build-for-vercel.sh')) {
    console.log(`${colors.red}✖ Missing build-for-vercel.sh${colors.reset}`);
    allGood = false;
  } else {
    console.log(`${colors.green}✓ Found build-for-vercel.sh${colors.reset}`);
  }
  
  if (!fs.existsSync('./build-for-netlify.sh')) {
    console.log(`${colors.red}✖ Missing build-for-netlify.sh${colors.reset}`);
    allGood = false;
  } else {
    console.log(`${colors.green}✓ Found build-for-netlify.sh${colors.reset}`);
  }
  
  // Check for shared schema
  if (!fs.existsSync('./shared/schema.ts')) {
    console.log(`${colors.red}✖ Missing shared/schema.ts${colors.reset}`);
    allGood = false;
  } else {
    console.log(`${colors.green}✓ Found shared/schema.ts${colors.reset}`);
  }
  
  console.log();
  return allGood;
}

function checkEnvVariables() {
  console.log(`${colors.bright}Checking environment variables...${colors.reset}\n`);

  // Create .env if it doesn't exist
  if (!fs.existsSync('./.env')) {
    console.log(`${colors.yellow}! Creating .env file with templates${colors.reset}`);
    
    const envContent = `# Database (required)
DATABASE_URL=postgresql://username:password@hostname:port/database

# Session (required for production)
SESSION_SECRET=your-very-secure-session-secret

# Email configuration (optional)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email-username
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@example.com
EMAIL_SECURE=false
`;
    
    fs.writeFileSync('./.env', envContent);
    console.log(`${colors.yellow}! Please edit .env file to add your database credentials${colors.reset}`);
    return false;
  }
  
  // Check if DATABASE_URL is set in .env
  const envContent = fs.readFileSync('./.env', 'utf8');
  if (!envContent.includes('DATABASE_URL=') || envContent.includes('DATABASE_URL=postgresql://username:password')) {
    console.log(`${colors.red}✖ DATABASE_URL is not set properly in .env${colors.reset}`);
    return false;
  }
  
  console.log(`${colors.green}✓ Environment variables look good${colors.reset}`);
  return true;
}

function runDeploymentPrep() {
  console.log(`\n${colors.bright}Running deployment preparation scripts...${colors.reset}\n`);
  
  try {
    console.log(`${colors.cyan}Running build-for-vercel.sh...${colors.reset}`);
    execSync('bash build-for-vercel.sh', { stdio: 'inherit' });
    
    console.log(`\n${colors.cyan}Running build-for-netlify.sh...${colors.reset}`);
    execSync('bash build-for-netlify.sh', { stdio: 'inherit' });
    
    console.log(`\n${colors.green}✓ Deployment preparation completed successfully${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`\n${colors.red}✖ Error running deployment scripts: ${error.message}${colors.reset}`);
    return false;
  }
}

function printDeploymentInstructions() {
  console.log(`
${colors.bright}${colors.green}=================================================
            DEPLOYMENT INSTRUCTIONS
=================================================
${colors.reset}

${colors.bright}1. Deploy Backend to Vercel${colors.reset}

   a. Sign in to your Vercel account
   b. Create a new project from Git
   c. Select your repository
   d. Configure project:
      - Root Directory: ${colors.yellow}backend${colors.reset}
      - Framework Preset: ${colors.yellow}Other${colors.reset}
      - Build Command: ${colors.yellow}npm run build${colors.reset}
      - Output Directory: ${colors.yellow}dist${colors.reset}
   e. Add environment variables:
      - ${colors.yellow}DATABASE_URL${colors.reset} (from your .env file)
      - ${colors.yellow}SESSION_SECRET${colors.reset} (from your .env file)
   f. Deploy and note the URL (e.g., ${colors.cyan}https://klede-backend.vercel.app${colors.reset})

${colors.bright}2. Deploy Frontend to Netlify${colors.reset}

   a. Sign in to your Netlify account
   b. Create a new site from Git
   c. Select your repository
   d. Configure build settings:
      - Base directory: ${colors.yellow}frontend${colors.reset}
      - Build command: ${colors.yellow}npm run build${colors.reset}
      - Publish directory: ${colors.yellow}dist${colors.reset}
   e. Add environment variables:
      - ${colors.yellow}VITE_API_URL${colors.reset} = ${colors.cyan}https://klede-backend.vercel.app${colors.reset} (your Vercel URL)
   f. Deploy and note the URL (e.g., ${colors.cyan}https://klede-waitlist.netlify.app${colors.reset})

${colors.bright}3. Update Netlify Redirects${colors.reset}

   a. Once deployed, go to your Netlify site settings
   b. Navigate to "Domain Management"
   c. Edit the "Redirects and rewrites" section
   d. Make sure API redirects point to your Vercel backend URL

${colors.bright}4. Update CORS Settings${colors.reset}

   a. Go to your Vercel project settings
   b. Add the environment variable:
      - ${colors.yellow}CORS_ALLOWED_ORIGINS${colors.reset} = ${colors.cyan}https://klede-waitlist.netlify.app${colors.reset} (your Netlify URL)
   c. Redeploy your Vercel project

${colors.bright}5. Test Your Deployment${colors.reset}

   Visit your Netlify URL and test the waitlist sign-up functionality.

For more detailed instructions, refer to:
- ${colors.cyan}DEPLOYMENT_GUIDE.md${colors.reset}
- ${colors.cyan}VERCEL_DEPLOYMENT.md${colors.reset}
- ${colors.cyan}NETLIFY_DEPLOYMENT.md${colors.reset}
`);
}

async function main() {
  printHeader();
  
  const environmentOk = checkEnvironment();
  if (!environmentOk) {
    console.log(`\n${colors.red}Please fix the above issues before continuing.${colors.reset}`);
    rl.close();
    return;
  }
  
  const envVarsOk = checkEnvVariables();
  if (!envVarsOk) {
    console.log(`\n${colors.yellow}Please set up your environment variables in .env before deploying.${colors.reset}`);
  }
  
  rl.question(`\n${colors.bright}Ready to prepare your project for deployment? (y/n) ${colors.reset}`, (answer) => {
    if (answer.toLowerCase() === 'y') {
      const prepOk = runDeploymentPrep();
      if (prepOk) {
        printDeploymentInstructions();
      }
    } else {
      console.log(`\n${colors.yellow}Deployment preparation cancelled.${colors.reset}`);
    }
    
    rl.close();
  });
}

main().catch(error => {
  console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
  process.exit(1);
});