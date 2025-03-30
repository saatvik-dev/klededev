#!/bin/bash
set -e

echo "Building for Netlify deployment..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Install specific dependencies that might be causing build issues
echo "Ensuring build dependencies are installed..."
npm install @babel/preset-typescript lightningcss --save-dev

# Build the client
echo "Building client..."
npm run build

# Create the necessary directories for Netlify functions
echo "Preparing Netlify functions directories..."
mkdir -p .netlify/functions
mkdir -p netlify/functions

# Copy any necessary files for serverless functions
echo "Processing Netlify functions..."
# Rename any .js files in netlify/functions to .cjs to ensure proper CommonJS handling
for file in netlify/functions/*.js; do
  if [ -f "$file" ]; then
    echo "Converting $file to CommonJS (.cjs) format"
    base_name=$(basename "$file" .js)
    mv "$file" "netlify/functions/${base_name}.cjs"
  fi
done

# Make sure we don't have any incompatible ESM/CJS mix
echo "Checking for API functions..."
if [ -f "netlify/functions/api.ts" ]; then
  echo "Backing up api.ts to avoid ESM/CJS conflicts"
  mv netlify/functions/api.ts netlify/functions/api.ts.backup
fi

# Attempt to run database migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
  echo "Database URL found, attempting to run migrations..."
  npx drizzle-kit push
  
  if [ $? -eq 0 ]; then
    echo "✅ Database migrations completed successfully"
  else
    echo "⚠️ Database migrations failed, you will need to run them manually"
    echo "   After deployment, use: netlify functions:invoke db-migrate --no-identity"
  fi
else
  echo "No DATABASE_URL found, skipping migrations"
  echo "You will need to set DATABASE_URL in Netlify environment variables"
fi

echo "Build completed successfully!"
echo "To deploy to Netlify, use:"
echo "  netlify deploy --prod"
echo " "
echo "Remember to set the DATABASE_URL and SESSION_SECRET in Netlify environment variables."