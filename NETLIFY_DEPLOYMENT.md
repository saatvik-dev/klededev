# Deploying to Netlify

This guide provides step-by-step instructions to deploy your Klede Waitlist application to Netlify.

## Prerequisites

1. A [Netlify](https://netlify.com) account
2. A PostgreSQL database from one of these providers:
   - [Neon](https://neon.tech) (Recommended - offers generous free tier)
   - [Supabase](https://supabase.com)
   - [Railway](https://railway.app) (PostgreSQL database)

## Option 1: Deploy via Netlify CLI (Recommended)

### Step 1: Install Netlify CLI

```bash
npm install -g netlify-cli
```

### Step 2: Prepare Your Database

1. Create a PostgreSQL database on your preferred platform
2. Get your database connection string in the format: `postgresql://username:password@host:port/database`
3. Make sure to enable SSL connections for your database

### Step 3: Login to Netlify

```bash
netlify login
```

### Step 4: Initialize and Deploy Your Site

```bash
# Initialize Netlify site
netlify init

# Build the project for Netlify
./build-for-netlify.sh

# Deploy to Netlify
netlify deploy --prod
```

### Step 5: Set Environment Variables

```bash
# Set environment variables
netlify env:set DATABASE_URL "your-database-connection-string"
netlify env:set SESSION_SECRET "your-random-session-secret"
netlify env:set NODE_ENV "production"
```

### Step 6: Push Database Schema

There are multiple ways to deploy your database schema:

**Option 1: Push schema directly from your machine**
```bash
# Make sure DATABASE_URL is set correctly in your .env file
npm run db:push
```

**Option 2: Use the built-in migration function after deployment**
```bash
# Invoke the db-migrate function through Netlify CLI
netlify functions:invoke db-migrate --no-identity
```

**Option 3: Automatic migrations during build**
If you've set DATABASE_URL in your Netlify environment variables, the build-for-netlify.sh script will automatically attempt to run migrations during deployment.

## Option 2: Deploy via Netlify Dashboard

### Step 1: Prepare Repository

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Make sure your repository is public or you've connected Netlify to your Git provider

### Step 2: Create a New Site in Netlify

1. Log in to your Netlify account
2. Click "New site from Git"
3. Select your repository
4. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Functions directory: `netlify/functions`

### Step 3: Configure Environment Variables

1. In your site dashboard, go to "Site settings" > "Environment variables"
2. Add the following environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SESSION_SECRET`: A random string for session security
   - `NODE_ENV`: Set to "production"

### Step 4: Deploy the Site

1. Trigger a manual deploy from the Netlify dashboard
2. Once deployed, use Netlify CLI to run the database migration:
   ```bash
   netlify login
   netlify link
   netlify functions:invoke db-migrate --no-identity
   ```

## Verifying Your Deployment

1. Open your deployed application URL
2. Test the waitlist form by submitting your email
3. Test the admin panel by navigating to `/admin` and logging in with:
   - Username: `admin`
   - Password: `admin`
4. Check that emails are sent correctly when users sign up

## Troubleshooting

### Database Connection Issues

If you encounter database connection errors:

1. Verify your `DATABASE_URL` is correct in Netlify environment variables
2. Make sure your database accepts connections from Netlify's IPs
3. If using Neon/Supabase, ensure you've enabled SSL connections
4. Check if your database requires a specific connection string format

### Database Migration Issues

If you're encountering "ECONNREFUSED" errors when running `db:push`:

1. **Local machine errors**: 
   - If running locally, ensure your PostgreSQL server is running on the expected port
   - Update your .env file with the correct DATABASE_URL
   - For cloud databases, make sure your local IP is allowed in the database firewall settings

2. **Netlify environment errors**:
   - Check the DATABASE_URL in Netlify environment variables
   - Use the built-in migration function: `netlify functions:invoke db-migrate --no-identity`
   - Check the function logs in Netlify dashboard for detailed error messages

### Function Errors

If Netlify Functions are not working:

1. Check the function logs in the Netlify dashboard
2. Verify the `netlify.toml` configuration
3. Make sure your API routes match what the client is calling
4. The project now uses `api-standalone.cjs` for serverless functions to avoid ESM/CJS compatibility issues
   - This file uses CommonJS format (.cjs extension) to be compatible with Node.js module system
   - API routes should point to `/.netlify/functions/api-standalone.cjs` in production

### Build Errors

If your deployment fails to build:

1. Check the build logs for errors
2. Make sure all dependencies are correctly specified in package.json
3. Verify your build script and publish directory settings
4. ESM/CJS Compatibility Issues:
   - If you see "Top-level await is not supported with 'cjs' output format" errors:
     - These are fixed by using the CommonJS function in `api-standalone.cjs`
     - The `.cjs` extension tells Node.js to use CommonJS module format
     - The original api.ts file has been renamed to avoid build conflicts
   - If you see "CommonJS 'exports' variable treated as global" warnings:
     - These are expected and don't affect functionality when using .cjs extension
5. If you see dependency errors (like missing @babel/preset-typescript or lightningcss):
   - These dependencies are now explicitly installed in the build process
   - The build-for-netlify.sh script handles installing these dependencies

## Custom Domains

To add a custom domain to your Netlify site:

1. Go to "Site settings" > "Domain management"
2. Click "Add custom domain"
3. Follow the instructions to configure DNS settings

## Congratulations!

Your Klede Waitlist application is now live on Netlify! 🎉