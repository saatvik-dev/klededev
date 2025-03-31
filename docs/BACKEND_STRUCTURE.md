# Backend Structure

This document provides an overview of the backend structure for the Klede Waitlist application, which is designed to be deployed to Vercel.

## Directory Structure

```
klede-waitlist/
├── api/                   # Vercel serverless API entry point
│   └── index.ts           # Main serverless function entry point
├── server/                # Core server code
│   ├── emails/            # Email functionality
│   │   ├── emailService.ts # Email sending service
│   │   └── templates.ts   # Email templates
│   ├── db.ts              # Database connection setup
│   ├── index.ts           # Main Express server initialization
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   └── vite.ts            # Development server integration
└── shared/                # Shared code
    └── schema.ts          # Database schema and types
```

## Key Components

### API Entry Point (`api/index.ts`)

This is the main entry point for serverless functions when deployed to Vercel. It:

- Sets up an Express application
- Configures CORS for cross-origin requests
- Sets up session management
- Registers API routes
- Handles error responses

### Server Code

The `server/` directory contains the core backend logic:

- **db.ts**: Initializes the database connection using the `drizzle-orm` library
- **routes.ts**: Defines all API endpoints and their handlers
- **storage.ts**: Implements database operations like creating, reading, updating, and deleting records
- **index.ts**: Sets up the Express server with all middleware and routes

### Email System

The email functionality is housed in the `server/emails/` directory:

- **emailService.ts**: A service that handles email sending using nodemailer
- **templates.ts**: Email templates for welcome emails, promotional emails, and launch announcements

### Shared Code

The `shared/` directory contains code that is used by both the frontend and backend:

- **schema.ts**: Defines the database schema using Drizzle ORM and Zod for validation

## API Routes

The main API routes are defined in `server/routes.ts` and include:

- `/api/waitlist`: Endpoints for managing the waitlist (GET, POST, DELETE)
- `/api/admin/login`: Authentication endpoint for admin access
- `/api/admin/logout`: Endpoint to log out admins
- `/api/admin/check`: Endpoint to verify admin authentication
- `/api/admin/promotional-email`: Endpoint to send promotional emails
- `/api/admin/launch-email`: Endpoint to send launch announcement emails

## Database Model

The application uses a PostgreSQL database with the following tables:

- **users**: Admin users who can access the dashboard
- **waitlist_entries**: Store email addresses of users who sign up for the waitlist

## Deployment to Vercel

For deployment to Vercel, the project includes:

- **vercel.json**: Configuration file for Vercel deployment
- **build-for-vercel.sh**: Build script that prepares the application for Vercel

The `build-for-vercel.sh` script:

1. Sets the environment to production
2. Builds the client application
3. Builds the server application using esbuild
4. Builds the API entry point

## Environment Variables

The backend relies on these environment variables:

- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Secret for session encryption
- **NODE_ENV**: Environment (development/production)

## CORS Configuration

CORS is configured in `api/index.ts` to allow requests from the frontend domain. This is particularly important when the frontend and backend are deployed to different platforms.