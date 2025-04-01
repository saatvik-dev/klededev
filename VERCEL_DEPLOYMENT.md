# Vercel Deployment Guide for Klede Backend

This guide provides step-by-step instructions for deploying the Klede Collection backend API to Vercel.

## Prerequisites

Before deploying to Vercel, ensure you have:

1. A [Vercel account](https://vercel.com/signup)
2. A GitHub repository containing your project
3. A PostgreSQL database (such as [Neon](https://neon.tech) or [Supabase](https://supabase.com))

## Deployment Steps

### 1. Prepare your repository

Ensure your repository contains the following files:

- `backend/vercel.json` - Configuration file for Vercel
- `build-for-vercel.sh` - Build script for Vercel deployment
- Make the build script executable with `chmod +x build-for-vercel.sh`

### 2. Set up your database

1. Create a PostgreSQL database on your preferred provider
2. Get your database connection string in the format: `postgresql://username:password@hostname:port/database`
3. Make sure your database is accessible from Vercel's IP ranges

### 3. Deploy to Vercel

#### Option 1: Using the Vercel Dashboard

1. Log in to [Vercel](https://vercel.com)
2. Click "Add New" > "Project"
3. Import your Git repository
4. Configure the project:
   - Framework Preset: "Other"
   - Root Directory: `.` (root of the repository)
   - Build Command: `./build-for-vercel.sh`
   - Output Directory: `.vercel_build/dist`
5. Add environment variables (see next section)
6. Click "Deploy"

#### Option 2: Using the Vercel CLI

1. Install the Vercel CLI: `npm i -g vercel`
2. Login to Vercel: `vercel login`
3. Initialize the project: `vercel init`
4. Deploy: `vercel --build-env NODE_ENV=production`

### 4. Configure environment variables

Add the following environment variables in Vercel's project settings:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@hostname:port/db` |
| `SESSION_SECRET` | Secret for encrypting sessions | Yes | `your-secure-random-string` |
| `CORS_ORIGIN` | Frontend URL for CORS | Yes | `https://klede-collection.netlify.app` |
| `EMAIL_HOST` | SMTP server host | No | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | No | `587` |
| `EMAIL_USER` | SMTP username | No | `your-email@example.com` |
| `EMAIL_PASS` | SMTP password | No | `your-email-password` |
| `EMAIL_FROM` | From address for emails | No | `noreply@your-domain.com` |

To add environment variables in the Vercel dashboard:
1. Go to your project
2. Click on "Settings" > "Environment Variables"
3. Add each variable and its value
4. Click "Save"

### 5. Trigger database migration

The first deployment will automatically create the necessary database tables. 

If you need to manually trigger migrations:
1. Redeploy your project
2. Check the logs to ensure migrations run successfully

### 6. Final configuration

1. Test your API endpoints
2. Update your frontend configuration to point to your Vercel API URL
3. Set up a custom domain (optional)

## Continuous Deployment

By default, Vercel will automatically deploy your site whenever you push changes to your repository. You can configure branch deployments in the Vercel project settings.

## Troubleshooting

### Database connection issues

If your API cannot connect to the database:

1. Verify your `DATABASE_URL` environment variable is correct
2. Check if your database provider allows connections from Vercel's IP ranges
3. Look for database errors in the Vercel deployment logs

### CORS errors

If you see CORS errors in the browser console:

1. Ensure `CORS_ORIGIN` matches your frontend URL exactly
2. For development, you may need to add multiple origins separated by commas 
3. Check if you have any proxy or CDN that changes the request origin

### Email sending issues

If welcome emails are not being sent:

1. Verify your email configuration environment variables
2. Check if your SMTP provider requires specific security settings or API keys
3. For Gmail, you may need to enable "Less secure app access" or use app passwords

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
- [Vercel Serverless Functions](https://vercel.com/docs/serverless-functions/introduction)
- [Connecting Vercel to PostgreSQL](https://vercel.com/guides/postgresql-with-prisma-and-vercel)