#!/bin/bash
set -e

echo "Building for Netlify deployment..."

# Install dependencies
echo "Installing dependencies..."
npm ci

# Install specific dependencies that might be causing build issues
echo "Ensuring build dependencies are installed..."
npm install @babel/preset-typescript lightningcss @types/express typescript tsx --save-dev

# Build the client
echo "Building client..."
npm run build

# Create the necessary directories for Netlify functions
echo "Preparing Netlify functions directories..."
mkdir -p dist/.netlify/functions
mkdir -p dist/netlify/functions

# Compile the API standalone function
echo "Compiling Netlify functions..."
npx tsc netlify/functions/api-standalone.ts --target ES2018 --module CommonJS --esModuleInterop true --outDir dist/netlify/functions/

# Copy the netlify.toml file to dist
echo "Copying netlify.toml to dist..."
cp netlify.toml dist/

# Create a simplified package.json for functions
echo "Creating package.json for functions..."
cat > dist/netlify/functions/package.json << EOF
{
  "name": "netlify-functions",
  "private": true,
  "dependencies": {
    "@netlify/functions": "^1.6.0",
    "express": "^4.18.2",
    "serverless-http": "^3.1.1",
    "pg": "^8.11.0",
    "drizzle-orm": "^0.28.0"
  }
}
EOF

# Copy the required modules for serverless functions
echo "Copying node_modules for functions..."
mkdir -p dist/netlify/functions/node_modules
cp -r node_modules/express dist/netlify/functions/node_modules/
cp -r node_modules/serverless-http dist/netlify/functions/node_modules/
cp -r node_modules/@netlify dist/netlify/functions/node_modules/
cp -r node_modules/pg dist/netlify/functions/node_modules/
cp -r node_modules/drizzle-orm dist/netlify/functions/node_modules/

# Ensure the necessary server files are available to functions
echo "Copying server files for functions..."
mkdir -p dist/netlify/functions/server
mkdir -p dist/netlify/functions/shared
cp -r server dist/netlify/functions/
cp -r shared dist/netlify/functions/

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
echo "When prompted, specify 'dist' as your publish directory."
echo " "
echo "Remember to set these environment variables in Netlify:"
echo "  DATABASE_URL - Your PostgreSQL connection string"
echo "  SESSION_SECRET - A random string for session security"
echo "  NODE_ENV - Set to 'production'"