# Netlify Deployment Guide

This document provides step-by-step instructions for deploying the frontend portion of the Klede application to Netlify.

## Prerequisites

- The backend is already deployed to Vercel at: `https://kledenamaste-qmo8d837j-saatviks-projects-2a4aa607.vercel.app`
- You have a Netlify account
- You have the Netlify CLI installed: `npm install -g netlify-cli`

## Deployment Steps

### 1. Log in to Netlify

```bash
netlify login
```

This will open a browser window to authorize your Netlify account.

### 2. Initialize Netlify for your project

```bash
netlify init
```

Follow the prompts:
- Choose "Create & configure a new site"
- Select your team
- Choose a site name (or accept the default)
- Use the default deployment settings (our `netlify.toml` configuration will be used)

### 3. Set up Environment Variables

You need to set the environment variables needed for your application:

```bash
# Set the API URL to point to your Vercel backend
netlify env:set VITE_API_URL https://kledenamaste-qmo8d837j-saatviks-projects-2a4aa607.vercel.app

# If you're using the same database for both frontend and backend:
netlify env:set DATABASE_URL your-database-url

# Set a secure session secret
netlify env:set SESSION_SECRET your-secure-session-secret
```

Alternatively, you can set these variables in the Netlify dashboard:
1. Go to Site settings > Build & deploy > Environment
2. Add the environment variables there

### 4. Deploy Your Site

```bash
netlify deploy --prod
```

This will build your site according to the configuration in `netlify.toml` and deploy it to production.

### 5. Update CORS Settings (if needed)

After your Netlify site is deployed, you'll need to update the CORS settings in your Vercel backend to allow requests from your Netlify domain:

1. Get your Netlify domain (e.g., `https://your-app.netlify.app`)
2. Update the `allowedOrigins` array in `api/index.ts` in your Vercel project
3. Re-deploy your Vercel project

```typescript
// api/index.ts
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  'https://your-app.netlify.app' // Your Netlify domain
];
```

## Testing Your Deployment

1. Visit your Netlify site URL
2. Make sure the frontend can successfully connect to the backend API
3. Test the waitlist signup functionality
4. Test the admin login and dashboard

## Troubleshooting

### CORS Issues

If you encounter CORS errors:
1. Check that your Netlify domain is added to the `allowedOrigins` array in the Vercel backend
2. Verify that the `VITE_API_URL` environment variable is set correctly in Netlify
3. Make sure the frontend code is using the correct URL via `getApiUrl()` function

### API Connection Issues

If the frontend can't connect to the backend:
1. Check that the `VITE_API_URL` environment variable is set correctly
2. Verify that the Vercel backend is running properly
3. Test the API endpoints directly using a tool like Postman or curl

### Database Connection Issues

If the application has database errors:
1. Ensure the `DATABASE_URL` environment variable is set correctly on both Vercel and Netlify
2. Check that the database server is accessible from both Vercel and Netlify
3. Verify that the database schema is properly set up

## Maintenance

Remember to update both the Vercel backend and Netlify frontend when making changes to your application. They need to be deployed separately but must remain in sync.