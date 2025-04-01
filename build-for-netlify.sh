#!/bin/bash
# Build script for Netlify deployment (frontend)

echo "Building frontend for Netlify deployment..."

# Create build directory
mkdir -p .netlify_build
mkdir -p .netlify_build/dist

# Create a clean dist directory
rm -rf .netlify_build/dist

# Copy frontend files to build directory
cp -r frontend/src .netlify_build/
cp -r shared .netlify_build/
cp frontend/package.json .netlify_build/
cp frontend/tsconfig.json .netlify_build/
cp frontend/tsconfig.node.json .netlify_build/
cp frontend/vite.config.ts .netlify_build/
cp frontend/netlify.toml .netlify_build/
cp -r frontend/public .netlify_build/ 2>/dev/null || :  # Ignore if public folder doesn't exist

# Set the API URL for production
API_URL=${VITE_API_URL:-"https://api.example.com"}
echo "VITE_API_URL=$API_URL" > .netlify_build/.env.production

# Install dependencies
cd .netlify_build && npm install

# Build the frontend
cd .netlify_build && npm run build

echo "Frontend build for Netlify completed successfully!"