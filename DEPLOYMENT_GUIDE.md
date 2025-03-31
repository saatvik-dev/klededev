# Deployment Guide for Klede

This guide explains how to deploy the Klede application using a split architecture approach:
- Backend: Deployed on Vercel
- Frontend: Deployed on Netlify

## Current Status

✅ **Backend:** Successfully deployed to Vercel
- URL: `https://kledenamaste-qmo8d837j-saatviks-projects-2a4aa607.vercel.app`

🔄 **Frontend:** Ready for deployment to Netlify

## Architecture Overview

This project uses a split architecture approach:

1. **Backend (Vercel)**
   - API routes and server logic
   - Database connections and queries
   - Authentication and server-side operations

2. **Frontend (Netlify)**
   - React application
   - UI components and client-side logic
   - Makes API calls to the Vercel backend

## Deployment Instructions

### Backend Deployment (Vercel) - ✅ COMPLETED

1. The backend has been successfully deployed to Vercel
2. Ensure you've set up the required environment variables in the Vercel dashboard:
   - `DATABASE_URL` - Your PostgreSQL database connection string
   - `SESSION_SECRET` - A secure random string for session encryption
   - `NODE_ENV` - Set to "production"

### Frontend Deployment (Netlify) - TODO

See the detailed instructions in `NETLIFY_DEPLOYMENT.md` for step-by-step guidance.

Key steps:
1. Install the Netlify CLI: `npm install -g netlify-cli`
2. Login: `netlify login`
3. Initialize: `netlify init`
4. Set environment variables:
   ```
   netlify env:set VITE_API_URL https://kledenamaste-qmo8d837j-saatviks-projects-2a4aa607.vercel.app
   netlify env:set DATABASE_URL your-database-url
   netlify env:set SESSION_SECRET your-secure-session-secret
   ```
5. Deploy: `netlify deploy --prod`

## Post-Deployment Configuration

After deploying the frontend to Netlify, you'll need to:

1. Update the CORS configuration in your Vercel backend to allow requests from your Netlify domain
2. Test the connection between frontend and backend
3. Verify that all features (waitlist signup, admin dashboard) work correctly

## Database Setup

Both the Vercel backend and Netlify frontend connect to the same PostgreSQL database. Ensure your database:

1. Has the correct schema (users and waitlist_entries tables)
2. Is accessible from both Vercel and Netlify
3. Has its connection string securely stored as an environment variable in both platforms

## Troubleshooting

See the "Troubleshooting" section in `NETLIFY_DEPLOYMENT.md` for common issues and solutions.

## Maintenance

When updating your application:

1. Make your code changes
2. Deploy backend changes to Vercel
3. Deploy frontend changes to Netlify
4. Ensure both deployments stay in sync

Remember to update environment variables if needed, and be careful with database schema changes that might require migrations.