#!/bin/bash

# Script to prepare files for Vercel deployment

# Ensure script fails on any command error
set -e

echo "Preparing backend for Vercel deployment..."

# Create 'shared' directory in the backend folder if it doesn't exist
mkdir -p backend/shared

# Copy the schema.ts file to the backend/shared directory
echo "Copying shared schema to backend/shared..."
cp shared/schema.ts backend/shared/

# Check if package.json exists in backend folder
if [ ! -f backend/package.json ]; then
  echo "Creating package.json in backend folder..."
  
  # Create minimal package.json if it doesn't exist
  cat > backend/package.json << EOF
{
  "name": "klede-backend",
  "version": "1.0.0",
  "description": "Klede Waitlist Application Backend",
  "scripts": {
    "build": "tsc",
    "start": "node dist/server/index.js",
    "db:push": "drizzle-kit push:pg"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "drizzle-kit": "^0.20.6",
    "drizzle-orm": "^0.29.1",
    "drizzle-zod": "^0.5.1",
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "nodemailer": "^6.9.7",
    "passport": "^0.6.0",
    "passport-local": "^1.0.0",
    "pg": "^8.11.3",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^4.17.21",
    "@types/express-session": "^1.17.10",
    "@types/node": "^20.10.0",
    "@types/nodemailer": "^6.4.14",
    "@types/passport": "^1.0.15",
    "@types/passport-local": "^1.0.38",
    "@types/pg": "^8.10.9",
    "typescript": "^5.3.2"
  }
}
EOF
fi

# Check if environment variables file exists
if [ ! -f backend/.env ]; then
  echo "Creating .env template in backend folder..."
  
  # Create .env template
  cat > backend/.env << EOF
# Database (required)
DATABASE_URL=postgresql://username:password@hostname:port/database

# Session (required for production)
SESSION_SECRET=your-very-secure-session-secret

# Email configuration (optional)
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_USER=your-email-username
EMAIL_PASS=your-email-password
EMAIL_FROM=noreply@example.com
EMAIL_SECURE=false

# CORS settings (if needed)
CORS_ALLOWED_ORIGINS=https://your-frontend.netlify.app
EOF
fi

echo "Backend preparation for Vercel completed!"