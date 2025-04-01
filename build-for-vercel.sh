#!/bin/bash
# Build script for Vercel deployment (backend)

echo "Building backend for Vercel deployment..."

# Create build directory
mkdir -p .vercel_build
mkdir -p .vercel_build/dist

# Create a clean dist directory
rm -rf .vercel_build/dist
mkdir -p .vercel_build/dist/server
mkdir -p .vercel_build/dist/shared

# Copy backend files to build directory
cp -r backend/server/* .vercel_build/dist/server/
cp -r backend/shared/* .vercel_build/dist/shared/
cp backend/package.json .vercel_build/
cp backend/tsconfig.json .vercel_build/
cp backend/vercel.json .vercel_build/

# Install dependencies
cd .vercel_build && npm install

# Build TypeScript files
cd .vercel_build && npx tsc

echo "Backend build for Vercel completed successfully!"