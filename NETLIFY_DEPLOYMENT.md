# Netlify Deployment Guide for Klede Frontend

This guide provides step-by-step instructions for deploying the Klede Collection frontend to Netlify.

## Prerequisites

Before deploying to Netlify, ensure you have:

1. A [Netlify account](https://app.netlify.com/signup)
2. A GitHub repository containing your project
3. The backend API already deployed on Vercel (or another platform)

## Deployment Steps

### 1. Prepare your repository

Ensure your repository contains the following files:

- `frontend/netlify.toml` - Configuration file for Netlify
- `build-for-netlify.sh` - Build script for Netlify deployment
- Make both files executable with `chmod +x build-for-netlify.sh`

### 2. Connect to Netlify

1. Log in to [Netlify](https://app.netlify.com/)
2. Click "Add new site" > "Import an existing project"
3. Connect to your Git provider (GitHub, GitLab, etc.)
4. Select your repository

### 3. Configure build settings

Configure your Netlify deployment settings:

| Setting | Value |
|---------|-------|
| Base directory | `/` |
| Build command | `./build-for-netlify.sh` |
| Publish directory | `.netlify_build/dist` |

### 4. Configure environment variables

Add the following environment variables in Netlify's site settings:

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | URL of your backend API | `https://klede-api.vercel.app` |

To add environment variables:
1. Go to Site settings > Build & deploy > Environment
2. Click "Edit variables"
3. Add the required variables

### 5. Deploy your site

1. Click "Deploy site"
2. Wait for the build process to complete (this can take a few minutes)
3. Once deployed, Netlify will provide a URL for your site (e.g., `https://klede-collection.netlify.app`)

### 6. Set up a custom domain (optional)

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow the instructions to configure your domain

## Continuous Deployment

By default, Netlify will automatically deploy your site whenever you push changes to your repository. You can configure specific branches for deployment in the build settings.

## Troubleshooting

### Build failures

If your build fails, check the build logs on Netlify for specific errors:

1. Go to the Deploys tab
2. Click on the failed deploy
3. Check the "Deploy log" for error messages

Common issues:
- Missing environment variables
- Errors in the build script
- Incompatible dependencies

### API Connection Issues

If the frontend cannot connect to the backend API:

1. Verify the `VITE_API_URL` environment variable is set correctly
2. Check CORS settings on your backend server
3. Ensure your backend is responding correctly

## Resources

- [Netlify Docs](https://docs.netlify.com/)
- [Environment Variables in Netlify](https://docs.netlify.com/configure-builds/environment-variables/)
- [Custom Domains in Netlify](https://docs.netlify.com/domains-https/custom-domains/)