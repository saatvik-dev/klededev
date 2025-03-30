# Deploying to Vercel

This guide provides detailed step-by-step instructions to deploy your Klede Waitlist application to Vercel.

## Prerequisites

1. A [Vercel](https://vercel.com) account
2. A PostgreSQL database from one of these providers:
   - [Neon](https://neon.tech) (Recommended - offers generous free tier)
   - [Supabase](https://supabase.com)
   - [Vercel Postgres](https://vercel.com/storage/postgres) (Integrated with Vercel)

## Option 1: Automated Deployment (Recommended)

We've prepared a script to automate the deployment process:

1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. Run our deployment script:
   ```bash
   chmod +x deploy-vercel.sh
   ./deploy-vercel.sh
   ```

4. Follow the prompts to provide your database URL and session secret.

5. The script will:
   - Configure all necessary environment variables
   - Deploy your project to Vercel
   - Set up the database schema
   - Provide you with a deployment URL

## Option 2: Manual Deployment

If you prefer to deploy manually, follow these steps:

### Step 1: Prepare Your Database

1. Create a new PostgreSQL database on your preferred platform
2. Get your database connection string: `postgresql://username:password@host:port/database`
3. Make sure to enable SSL connections for your database

### Step 2: Initialize a Vercel Project

1. Install the Vercel CLI and log in:
   ```bash
   npm install -g vercel
   vercel login
   ```

2. Initialize a new Vercel project in your repository:
   ```bash
   vercel
   ```

3. Answer the configuration questions:
   - Set up and deploy? `Yes`
   - Link to existing project? `No`
   - Project name: `[your-project-name]`
   - Directory: `./` (current directory)
   - Override settings? `No`

### Step 3: Configure Environment Variables

1. Add your environment variables to Vercel:
   ```bash
   vercel env add DATABASE_URL
   # Enter your PostgreSQL connection string when prompted
   
   vercel env add SESSION_SECRET
   # Enter a secure random string when prompted
   
   vercel env add NODE_ENV
   # Enter "production" when prompted
   ```

2. Deploy these environment variables to production:
   ```bash
   vercel env deploy production
   ```

### Step 4: Deploy the Project

1. Deploy your project:
   ```bash
   vercel --prod
   ```

### Step 5: Set Up the Database Schema

After deployment completes, you need to set up your database schema:

1. Pull environment variables to your local environment:
   ```bash
   vercel env pull
   ```

2. Run the database migrations:
   ```bash
   npm run db:push
   ```

## Verifying Your Deployment

1. Open your deployed application at the URL provided by Vercel
2. Test the waitlist form by submitting your email
3. Test the admin panel by navigating to `/admin` and logging in with:
   - Username: `admin`
   - Password: `admin`
4. Check that emails are sent correctly when users sign up

## Troubleshooting Common Issues

### Database Connection Errors

If you see database connection errors:

1. Verify your `DATABASE_URL` is correct in Vercel environment variables
2. Make sure your database accepts connections from Vercel's IPs
3. If using Neon/Supabase, ensure you've enabled SSL connections
4. Check if your database requires a specific connection string format

### Build Errors

If your deployment fails to build:

1. Check the Vercel build logs for errors
2. Verify that all necessary environment variables are set
3. Try rebuilding the deployment from the Vercel dashboard

### API Routes Not Working

If API routes return 404 errors:

1. Make sure your database schema has been properly set up
2. Check Vercel logs for any server-side errors
3. Verify that the API routes match what the client is calling

## Congratulations!

Your Klede Waitlist application is now live on Vercel! 🎉

## Need Help?

If you continue to experience issues:

1. Check the Vercel documentation: https://vercel.com/docs
2. Explore the Function Logs in your Vercel dashboard
3. Contact Vercel support if needed