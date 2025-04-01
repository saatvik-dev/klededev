#!/bin/bash

# Script to prepare files for Netlify deployment

# Ensure script fails on any command error
set -e

echo "Preparing frontend for Netlify deployment..."

# Create shared directory in the frontend folder if it doesn't exist
mkdir -p frontend/shared

# Copy the schema.ts file to the frontend/shared directory
echo "Copying shared schema to frontend/shared..."
cp shared/schema.ts frontend/shared/

# Check if package.json exists in frontend folder
if [ ! -f frontend/package.json ]; then
  echo "package.json already created in frontend folder"
fi

# Check if environment variables file exists
if [ ! -f frontend/.env ]; then
  echo "Creating .env template in frontend folder..."
  
  # Create .env template
  cat > frontend/.env << EOF
# API URL (required for production)
VITE_API_URL=https://your-backend.vercel.app
EOF
fi

# Make sure netlify.toml exists
if [ ! -f frontend/netlify.toml ]; then
  echo "Creating netlify.toml in frontend folder..."
  
  cat > frontend/netlify.toml << EOF
[build]
  base = "frontend"
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/api/*"
  to = "https://klede-backend.vercel.app/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
EOF
fi

echo "Frontend preparation for Netlify completed!"