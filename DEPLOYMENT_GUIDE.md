# Klede Waitlist - Deployment Guide

This guide explains how to deploy the Klede Waitlist application with a split architecture:
- Backend API on Vercel
- Frontend on Netlify

## Prerequisites

1. Accounts on both [Vercel](https://vercel.com) and [Netlify](https://netlify.app)
2. A PostgreSQL database (recommended options: [Neon](https://neon.tech), [Supabase](https://supabase.com))
3. Git repository with your project code

## Step 1: Set Up Your Database

1. Create a PostgreSQL database with your preferred provider
2. Make note of your database connection URL: `postgresql://username:password@host:port/database`
3. Ensure SSL connections are enabled for production use

## Step 2: Deploy Backend to Vercel

### Option 1: Using Vercel CLI (Recommended)

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Log in to Vercel:
   ```bash
   vercel login
   ```

3. From the project root, deploy the backend:
   ```bash
   vercel
   ```
   
4. Answer the setup questions:
   - Set up and deploy? Yes
   - Which scope? (Select your account/org)
   - Link to existing project? No
   - Project name? klede-waitlist-backend (or your preferred name)
   - Directory? ./
   - Override settings? Yes
   - Build Command: bash ./build-for-vercel.sh
   - Output Directory: dist/public
   - Development Command: npm run dev

5. Set environment variables:
   ```bash
   vercel env add DATABASE_URL
   # Paste your PostgreSQL connection string when prompted
   
   vercel env add SESSION_SECRET
   # Enter a secure random string when prompted
   
   vercel env add NODE_ENV
   # Enter "production" when prompted
   ```

6. Deploy to production:
   ```bash
   vercel --prod
   ```

7. Note your backend API URL (e.g., https://klede-waitlist-backend.vercel.app)

### Option 2: Using Vercel Web Dashboard

1. Connect your Git repository to Vercel
2. Configure build settings:
   - Build Command: `bash ./build-for-vercel.sh`
   - Output Directory: `dist/public`
3. Add environment variables (DATABASE_URL, SESSION_SECRET, NODE_ENV)
4. Deploy and note your API URL

## Step 3: Update Frontend Configuration

Before deploying the frontend, you need to update the API URL in the frontend code:

1. Edit `client/src/lib/queryClient.ts` to point to your Vercel backend:

```typescript
function getApiUrl(path: string): string {
  // In production, use the Vercel API URL
  if (import.meta.env.PROD) {
    return `https://your-backend.vercel.app${path}`;
  }
  
  // In development, use the local API
  return path;
}
```

2. Replace `https://your-backend.vercel.app` with your actual Vercel deployment URL

## Step 4: Deploy Frontend to Netlify

### Option 1: Using Netlify CLI (Recommended)

1. Install the Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Log in to Netlify:
   ```bash
   netlify login
   ```

3. Initialize a new Netlify site:
   ```bash
   netlify init
   ```

4. Build for Netlify:
   ```bash
   ./build-for-netlify.sh
   ```

5. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

6. Set the required environment variable for the API_URL:
   ```bash
   netlify env:set VITE_API_URL "https://your-backend.vercel.app"
   # Replace with your actual Vercel backend URL
   ```

### Option 2: Using Netlify Web Dashboard

1. Connect your Git repository to Netlify
2. Configure build settings:
   - Build Command: `./build-for-netlify.sh`
   - Publish Directory: `dist/public`
3. Add environment variables:
   - `VITE_API_URL`: Your Vercel backend URL
4. Deploy your site

## Step 5: Update CORS Settings

After deployment, update the CORS settings in both backend files with your actual domain names:

1. In `api/index.ts`:
   - Replace placeholder domains with your actual Netlify domain
   - Redeploy to Vercel

2. In `netlify/functions/api-standalone.cjs`:
   - Replace placeholder domains with your actual domains
   - Redeploy to Netlify if you're also using Netlify for a serverless API

## Testing the Deployment

1. Visit your Netlify frontend URL
2. Test the waitlist signup feature
3. Test the admin panel at `/admin`
4. Verify that emails are being sent correctly

## Troubleshooting

### CORS Issues

If you're experiencing CORS errors:

1. Check that your CORS settings in the backend include your frontend domain
2. Make sure the API URL in the frontend is correct
3. Use your browser's developer tools to identify the specific CORS error

### Database Connection Issues

If the API cannot connect to the database:

1. Verify your DATABASE_URL environment variable
2. Ensure your database allows connections from Vercel/Netlify IPs
3. Check that SSL is properly configured

### Build Errors

If your builds fail:

1. Check the build logs for specific errors
2. Ensure all required environment variables are set
3. Verify that the build scripts have execute permissions (`chmod +x build-for-netlify.sh`)

## Conclusion

You now have a fully deployed application with:
- Backend API running on Vercel
- Frontend running on Netlify
- PostgreSQL database for data storage

This split architecture provides excellent performance and scalability while keeping your frontend and backend concerns separate.