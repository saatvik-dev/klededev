# Netlify Deployment Guide for Klede Frontend

This guide provides detailed instructions for deploying the Klede frontend to Netlify.

## Prerequisites

Before you begin, make sure you have:

1. A Netlify account
2. A Git repository with your Klede project
3. Your backend deployed to Vercel (see [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md))
4. Node.js 18+ installed locally

## Setup Steps

### 1. Prepare Your Project

Ensure your project structure has:
- The frontend code in the `/frontend` directory
- A valid `netlify.toml` with appropriate configuration
- Environment variables properly referenced in your code

### 2. Run the Preparation Script

Execute the preparation script to copy necessary files:

```bash
bash build-for-netlify.sh
```

This script will copy the shared schema to the frontend directory to ensure it's included in the build.

### 3. Connect Your Repository to Netlify

1. Log in to your Netlify account
2. Click "Add new site" > "Import an existing project"
3. Connect to your Git provider (GitHub, GitLab, Bitbucket)
4. Select the repository that contains your Klede project

### 4. Configure Deployment Settings

Set the following configuration options:

- **Base directory**: `frontend`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### 5. Environment Variables

Add the following environment variables in the Netlify UI:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | The URL of your Vercel backend | `https://your-backend.vercel.app` |

### 6. Deploy

1. Click "Deploy site" to start the deployment process
2. Netlify will build and deploy your frontend
3. Once complete, you'll receive a deployment URL (e.g., `https://klede-waitlist.netlify.app`)

### 7. Verify the Deployment

1. Visit your Netlify URL
2. Verify that the waitlist signup form works correctly
3. Test other frontend functionality

## Configure Custom Domain (Optional)

To use a custom domain:

1. Go to "Site settings" > "Domain management"
2. Click "Add custom domain"
3. Enter your domain name
4. Follow the DNS configuration instructions

## Configure Redirects and Headers

The `netlify.toml` file in your frontend directory includes:

1. **API Redirects**: Forwards all `/api/*` requests to your Vercel backend
2. **SPA Redirects**: Ensures your React app handles client-side routing correctly

If you need to add additional redirects or headers:

1. Edit the `netlify.toml` file in your frontend directory
2. Add the necessary redirect or header rules
3. Redeploy the site

Example of CORS headers for your API:

```toml
[[headers]]
  for = "/api/*"
  [headers.values]
    Access-Control-Allow-Origin = "*"
    Access-Control-Allow-Methods = "GET, POST, OPTIONS"
    Access-Control-Allow-Headers = "Origin, X-Requested-With, Content-Type, Accept"
```

## Continuous Deployment

Netlify automatically sets up continuous deployment:

1. Every push to your main branch triggers a new deployment
2. For pull requests, Netlify creates preview deployments
3. You can configure deployment settings for different branches

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check Netlify build logs for errors
   - Ensure all dependencies are correctly installed
   - Verify your build command is working locally

2. **API Connection Issues**:
   - Ensure `VITE_API_URL` is correctly set
   - Check CORS settings on your Vercel backend
   - Verify API paths in your frontend code

3. **Routing Issues**:
   - Ensure your `netlify.toml` has proper redirects for client-side routing
   - Check that your React router is configured correctly
   - Test navigation on different routes

## Performance Optimization

To optimize your Netlify site:

1. **Asset Optimization**:
   - Enable Netlify's asset optimization in site settings
   - Configure appropriate cache headers for static assets

2. **Build Caching**:
   - Use Netlify's build plugins to cache dependencies
   - Optimize your build scripts for faster builds

3. **Serverless Functions** (if needed):
   - Use Netlify Functions for backend functionality that can't be handled by Vercel
   - Create functions in the `netlify/functions` directory

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Netlify Build Configuration](https://docs.netlify.com/configure-builds/overview/)
- [Netlify Redirects and Rewrites](https://docs.netlify.com/routing/redirects/)
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)