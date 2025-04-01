# Klede Split Deployment Guide

This guide provides instructions for deploying the Klede application with its split architecture: backend on Vercel and frontend on Netlify.

## Architecture Overview

The Klede application uses a split architecture:

1. **Backend (API)**: Deployed on Vercel as a serverless API
2. **Frontend**: Deployed on Netlify as a static site with client-side rendering

This split approach offers several advantages:
- Better scalability for each component independently
- Ability to update frontend and backend separately
- Leveraging the strengths of each platform (Vercel for API routes, Netlify for static sites)

## Prerequisites

Before you begin, make sure you have:

1. A Vercel account
2. A Netlify account
3. A Git repository with your Klede project
4. A PostgreSQL database (e.g., Neon, Supabase, or any other provider)
5. Node.js 18+ installed locally

## Deployment Process

### 1. Prepare Your Environment Variables

Create a `.env` file in the project root with the following variables:

```
# Database (required)
DATABASE_URL=postgresql://username:password@hostname:port/database

# Session (required for production)
SESSION_SECRET=your-very-secure-session-secret

# Email configuration (optional, uses Ethereal for testing if not provided)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email-username
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@example.com
EMAIL_SECURE=false
```

Note: These variables are for local development. You will need to set them separately in your Vercel and Netlify environments.

### 2. Deploy Backend to Vercel

1. Run the preparation script:
   ```
   bash build-for-vercel.sh
   ```

2. Create a new project on Vercel:
   - Connect to your Git repository
   - Set the root directory to `backend`
   - Set the framework preset to "Other"
   - Set the build command to `npm run build`
   - Set the output directory to `dist`

3. Configure environment variables in Vercel:
   - `DATABASE_URL` (your PostgreSQL connection string)
   - `SESSION_SECRET` (a secure random string)
   - `NODE_ENV` (set to "production")
   - Email configuration variables (if needed)

4. Deploy your backend and note the deployment URL (e.g., `https://your-backend.vercel.app`)

For detailed Vercel deployment instructions, see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md).

### 3. Deploy Frontend to Netlify

1. Run the preparation script:
   ```
   bash build-for-netlify.sh
   ```

2. Create a new site on Netlify:
   - Connect to your Git repository
   - Set the base directory to `frontend`
   - Set the build command to `npm run build`
   - Set the publish directory to `dist`

3. Configure environment variables in Netlify:
   - `VITE_API_URL` (the URL of your Vercel backend from step 2)

4. Deploy your frontend

For detailed Netlify deployment instructions, see [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md).

### 4. Configure CORS (If Needed)

If you experience CORS issues, update your backend's Vercel environment variables:

- `CORS_ALLOWED_ORIGINS` (comma-separated list of allowed origins, including your Netlify domain)

### 5. Test Your Deployment

After both deployments are complete:

1. Visit your Netlify frontend URL
2. Test the waitlist signup functionality
3. Test the admin login using the default credentials (admin/admin123)
4. Test all admin functionality (viewing waitlist, sending emails, etc.)

## Deployment Helper

This project includes a deployment helper script to guide you through the process:

```
node deploy.js
```

## Troubleshooting

### Backend Deployment Issues

- **Database Connection Errors**: Verify your `DATABASE_URL` is correct and that your IP is allowed in the database firewall rules.
- **Missing Environment Variables**: Check that all required environment variables are set in Vercel.
- **Serverless Function Timeout**: If your functions time out, consider optimizing database queries or connection pooling settings.

### Frontend Deployment Issues

- **API Connection Errors**: Make sure `VITE_API_URL` is correctly set in your Netlify environment.
- **Build Failures**: Check Netlify build logs for errors and ensure all dependencies are correctly installed.
- **Routing Issues**: Ensure your Netlify configuration includes proper redirects for client-side routing.

## Updating Your Deployment

After making changes to your application:

1. Push your changes to the Git repository
2. Vercel and Netlify will automatically rebuild and deploy your changes

If you've made changes to the database schema, you'll need to manually migrate your production database using:

```
npm run db:push
```

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)