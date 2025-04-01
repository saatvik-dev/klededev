# Klede Collection - Deployment Guide

This guide outlines the complete deployment process for the Klede Collection application, which uses a split architecture with a frontend deployed on Netlify and a backend deployed on Vercel.

## Architecture Overview

The Klede Collection application consists of:

1. **Frontend (React/Vite)**: A responsive single-page application for collecting waitlist information
2. **Backend (Express)**: A RESTful API server handling data persistence and email notifications
3. **Database (PostgreSQL)**: A PostgreSQL database for storing waitlist entries

![Architecture Diagram](https://mermaid.ink/img/pako:eNqFkk1PwzAMhv9KlBNIlNKNVhpI2w5wAcSFG-LSJqZEtInWZBqi_Hdsp2xMQnDzx7Mff5KvYNyEIEFbt3N-KwxjvPKmDvDtg2nLtTVxoIdCQW9sQ5XnKmgMCgp1Dd7vMDrG06WCWr1lxWJZzNdQaRe9c1BBf8Jy6TUUyJ1ePCvTNmHqnTnUbmvdtHdFP_aUhb1z_mTcse5x3IPf4oZdXXluHWKFg5-7MFUwOz-1jqF3NhkXO6CnW6bXTvtYlrEF3S_rJHZIv-cqpYOoYGYap5VRcZMZ5fQpS_NNSTXsMqeP6y-2sPW2gTxEDUqKDOSUZZxzwfOJHNOCi9GdiRiAjBGxSCSIaS5YwcecT9iYslyIVN8vE8nZ4OLx3dkdPFw9L2BxuX56WD_-3QNyLmcsSSnBJclGnL2-AA3JqN0)

## Prerequisites

Before deploying, ensure you have:

1. A GitHub repository containing your project
2. Accounts on Netlify and Vercel 
3. A PostgreSQL database (such as Neon, Supabase, or any PostgreSQL provider)
4. Required environment variables (listed in the platform-specific guides)

## Deployment Process

The deployment is split into two parts:

1. **Backend deployment to Vercel**
2. **Frontend deployment to Netlify**

### Step 1: Deploy the backend to Vercel

Follow the steps in [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) to deploy the backend API to Vercel.

Key points:
- The backend uses Node.js with Express
- Set up required environment variables in Vercel
- Configure the database connection string
- Ensure CORS is properly configured to allow requests from your frontend

### Step 2: Deploy the frontend to Netlify

After successfully deploying the backend, follow the steps in [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md) to deploy the frontend to Netlify.

Key points:
- Set the `VITE_API_URL` environment variable to point to your Vercel backend URL
- Use the provided build script for deployment
- Netlify will build and serve the frontend application

### Step 3: Test the complete application

After deploying both parts:

1. Visit your Netlify URL
2. Test the waitlist signup process
3. Verify that submissions appear in the database
4. Check that welcome emails are being sent (if configured)

## Environment Variables

### Backend (Vercel)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgresql://user:pass@hostname:port/db` |
| `SESSION_SECRET` | Secret for session encryption | Yes | `random-secret-string` |
| `CORS_ORIGIN` | Frontend URL for CORS | Yes | `https://your-app.netlify.app` |
| `EMAIL_HOST` | SMTP server host | No | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | No | `587` |
| `EMAIL_USER` | SMTP username | No | `your-email@example.com` |
| `EMAIL_PASS` | SMTP password | No | `your-password` |
| `EMAIL_FROM` | From address for emails | No | `noreply@your-domain.com` |

### Frontend (Netlify)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_API_URL` | URL of your backend API | Yes | `https://your-api.vercel.app` |

## Troubleshooting

### Cross-Origin (CORS) Issues

If you encounter CORS errors:

1. Ensure `CORS_ORIGIN` in the backend matches your frontend URL exactly
2. Check for any typos in the domain names
3. Remember to include the protocol (https://) in the CORS configuration

### Database Connection Issues

If the backend can't connect to the database:

1. Verify your `DATABASE_URL` is correct
2. Ensure your database provider allows connections from Vercel's IP ranges
3. Check if your database requires SSL connections

### Email Sending Issues

If welcome emails aren't working:

1. Verify your email service provider credentials
2. Some providers (like Gmail) require less secure app access or app passwords
3. Check spam folders for test emails

## Ongoing Maintenance

### Updating the Application

When you need to update your application:

1. Push changes to your GitHub repository
2. Vercel and Netlify will automatically rebuild and deploy
3. Check deployment logs for any errors

### Database Migrations

For database schema changes:

1. Update the schema in `shared/schema.ts`
2. Redeploy the backend to apply migrations
3. Be careful with destructive changes that might result in data loss

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Express.js Documentation](https://expressjs.com/)