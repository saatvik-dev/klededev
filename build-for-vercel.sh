#!/bin/bash

# Build script for Vercel deployment
set -e  # Exit immediately if a command exits with a non-zero status

echo "Setting up environment..."
export NODE_ENV=production

echo "Creating necessary directories..."
mkdir -p dist
mkdir -p dist/api

echo "Building client application..."
npm run build

echo "Building server application..."
# Build the server files
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=cjs --outdir=dist

echo "Building API entry points..."
# Build the main API handler - use CommonJS for Vercel serverless
npx esbuild api/index.ts --platform=node --packages=external --bundle --format=cjs --outdir=dist/api
npx esbuild api/logs.ts --platform=node --packages=external --bundle --format=cjs --outdir=dist/api
npx esbuild api/db-migrate.ts --platform=node --packages=external --bundle --format=cjs --outdir=dist/api

# Rename files to .js extension instead of .cjs to match Vercel's expectations
echo "Ensuring correct file extensions..."
if [ -f "dist/api/index.cjs" ]; then
  mv dist/api/index.cjs dist/api/index.js
fi
if [ -f "dist/api/logs.cjs" ]; then
  mv dist/api/logs.cjs dist/api/logs.js
fi
if [ -f "dist/api/db-migrate.cjs" ]; then
  mv dist/api/db-migrate.cjs dist/api/db-migrate.js
fi

# Create package.json for CommonJS compatibility
echo "Creating package.json files for module compatibility..."
echo '{
  "type": "commonjs",
  "engines": {
    "node": ">=18.x"
  }
}' > dist/api/package.json

echo "Creating Vercel configuration files..."
# Create a minimal _vercel.json in the output directory for runtime configuration
echo '{
  "version": 2,
  "regions": ["iad1"]
}' > dist/_vercel.json

echo "✅ Build completed successfully!"