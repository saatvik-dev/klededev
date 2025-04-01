# Vercel Deployment Guide for Klede Backend

This guide provides detailed instructions for deploying the Klede backend to Vercel.

## Prerequisites

Before you begin, make sure you have:

1. A Vercel account
2. A Git repository with your Klede project
3. A PostgreSQL database (e.g., Neon, Supabase, or any other provider)
4. Node.js 18+ installed locally

## Setup Steps

### 1. Prepare Your Project

Ensure your project structure has:
- The backend code in the `/backend` directory
- A valid `tsconfig.json` with proper configuration
- A `vercel.json` file with routes configuration
- Proper environment variable references in your code

### 2. Run the Preparation Script

Execute the preparation script to copy necessary files:

```bash
bash build-for-vercel.sh
```

This script will copy the shared schema to the backend directory to ensure it's included in the deployment.

### 3. Connect Your Repository to Vercel

1. Log in to your Vercel account
2. Click "Add New" > "Project"
3. Connect to your Git provider (GitHub, GitLab, Bitbucket)
4. Select the repository that contains your Klede project

### 4. Configure Deployment Settings

Set the following configuration options:

- **Framework Preset**: Other
- **Root Directory**: `backend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 5. Environment Variables

Add the following environment variables in the Vercel UI:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:port/database` |
| `SESSION_SECRET` | Secret for session encryption | `your-secure-session-secret` |
| `NODE_ENV` | Environment mode | `production` |
| `CORS_ALLOWED_ORIGINS` | Allowed origins for CORS | `https://your-frontend.netlify.app` |

Optional email configuration:

| Variable | Description | Example |
|----------|-------------|---------|
| `EMAIL_HOST` | SMTP server hostname | `smtp.example.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USER` | SMTP username | `your-email-username` |
| `EMAIL_PASS` | SMTP password | `your-email-password` |
| `EMAIL_FROM` | From email address | `noreply@example.com` |
| `EMAIL_SECURE` | Use SSL/TLS | `false` |

### 6. Deploy

1. Click "Deploy" to start the deployment process
2. Vercel will build and deploy your backend
3. Once complete, you'll receive a deployment URL (e.g., `https://klede-backend.vercel.app`)

### 7. Verify the Deployment

Test your API endpoints:

1. Visit `https://your-deployment-url.vercel.app/api/health` to check the health endpoint
2. Test other endpoints as needed

## Serverless Optimizations

### Database Connection Pooling

For serverless environments:

1. Use the appropriate connection pooling settings in `server/db.ts`
2. Consider using edge-optimized database drivers like `@neondatabase/serverless` for better performance

### Cold Start Optimization

To minimize cold start times:

1. Keep your dependencies minimal
2. Use separate files for different API routes to reduce bundle size
3. Consider edge functions for faster cold starts

## Custom Domain Setup (Optional)

To use a custom domain:

1. Go to your project settings in Vercel
2. Click on "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

## Continuous Deployment

Vercel automatically sets up continuous deployment:

1. Every push to your main branch triggers a new deployment
2. For pull requests, Vercel creates preview deployments
3. You can configure deployment settings for different branches

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Check that your `DATABASE_URL` is correct
   - Ensure your database allows connections from Vercel's IP ranges
   - Verify SSL settings if required by your database provider

2. **Environment Variable Issues**:
   - Ensure all required environment variables are set in Vercel
   - Check for typos in variable names
   - Verify that the variables are being properly accessed in your code

3. **Build Failures**:
   - Review build logs in the Vercel dashboard
   - Ensure all dependencies are correctly listed in `package.json`
   - Check for TypeScript compilation errors

4. **Serverless Function Timeouts**:
   - Optimize database queries to reduce execution time
   - Consider breaking up large functions into smaller ones
   - Use connection pooling to reduce initialization time

## Monitoring and Logs

To monitor your application:

1. Use the Vercel dashboard to view deployment logs
2. Check the "Functions" tab to see serverless function metrics
3. Consider setting up additional monitoring (like Sentry) for production use

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel for Git](https://vercel.com/docs/concepts/git)