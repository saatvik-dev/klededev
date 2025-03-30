#!/bin/bash

# Build script for Vercel deployment

echo "Setting up environment..."
export NODE_ENV=production

echo "Building client application..."
npm run build

# Create package.json in dist for ESM compatibility
echo '{
  "type": "module",
  "engines": {
    "node": ">=18.x"
  }
}' > dist/package.json

echo "Building server application..."
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

echo "Building API entry point..."
# Use CJS format for API handler compatibility with Vercel serverless
npx esbuild api/index.ts --platform=node --packages=external --bundle --format=cjs --outdir=dist/api

# Create special package.json for API folder with CommonJS
echo '{
  "type": "commonjs",
  "engines": {
    "node": ">=18.x"
  }
}' > dist/api/package.json

echo "Generating additional compatibility wrappers..."
# Create index.js in the root for compatibility
echo 'export * from "./api/index.js";' > dist/index.js

echo "Build completed successfully!"