#!/bin/bash

# Optimize and compress for Vercel deployment
set -e  # Exit immediately if a command exits with a non-zero status

echo "🔍 Analyzing project size..."
initial_size=$(du -sh . | cut -f1)
echo "Initial project size: $initial_size"

echo "🧹 Cleaning unnecessary files..."
# Remove large files that aren't needed for deployment
rm -rf .git
rm -rf attached_assets
rm -rf node_modules/.cache
find . -name "*.log" -delete
find . -name "*.map" -delete
find . -name "*.test.*" -delete
find . -name "*.spec.*" -delete

echo "🔧 Setting up build environment..."
export NODE_ENV=production

echo "📦 Creating minimal directory structure..."
mkdir -p dist
mkdir -p dist/api

echo "🛠️ Building client application with optimization flags..."
# Use Vite with high compression settings
VITE_COMPRESS=true VITE_MINIFY=true npm run build

echo "⚙️ Building server components..."
# Bundle server code with maximum optimizations
npx esbuild server/index.ts --platform=node --packages=external --bundle --minify --format=cjs --outdir=dist

echo "🔌 Building API functions..."
# Bundle API handlers with maximum optimizations
for file in api/*.ts; do
  npx esbuild $file --platform=node --packages=external --bundle --minify --format=cjs --outdir=dist/api
done

echo "🧪 Ensuring correct file extensions..."
# Rename files to .js extension to match Vercel's expectations
for file in dist/api/*.cjs; do
  if [ -f "$file" ]; then
    mv "$file" "${file%.cjs}.js"
  fi
done

echo "🗂️ Creating package.json for module compatibility..."
echo '{
  "type": "commonjs",
  "engines": {"node": ">=18.x"}
}' > dist/api/package.json

echo "⚡ Creating Vercel configuration..."
# Create optimized vercel.json in the output directory
echo '{
  "version": 2,
  "routes": [
    {"src": "/api/(.*)", "dest": "/api/index.js"},
    {"src": "/(.*)", "dest": "/$1"}
  ]
}' > dist/vercel.json

echo "📏 Checking final size..."
final_size=$(du -sh dist | cut -f1)
echo "✅ Optimized build created successfully!"
echo "Final deployment size: $final_size"

if [ -f ".vercel/output/config.json" ]; then
  echo "📣 Vercel output directory already exists, removing it first"
  rm -rf .vercel/output
fi

echo "🌍 Preparing for Vercel deployment..."
mkdir -p .vercel/output
cp -r dist/* .vercel/output/
mkdir -p .vercel/output/functions/api
cp -r dist/api/* .vercel/output/functions/api/

echo "🧩 Creating Vercel config..."
echo '{
  "version": 3,
  "routes": [
    {"src": "/api/(.*)", "dest": "/api/index.js"},
    {"src": "/(.*)", "dest": "/$1"}
  ]
}' > .vercel/output/config.json

echo "📊 Final deployment package size:"
du -sh .vercel/output

echo "🚀 Run 'vercel deploy --prebuilt' to deploy this optimized build"