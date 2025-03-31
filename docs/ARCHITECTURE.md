# Klede Waitlist Application Architecture

This document explains the architecture of the Klede Waitlist application, with a focus on how the backend and frontend are separated for deployment to different platforms.

## Project Structure

The application is organized into clearly separated frontend and backend components:

```
klede-waitlist/
├── api/                   # Vercel serverless API entry point
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── hooks/         # React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── pages/         # Page components
│   │   ├── App.tsx        # Main application component
│   │   └── main.tsx       # Application entry point
│   └── index.html         # HTML template
├── netlify/               # Netlify-specific configurations
│   └── functions/         # Netlify serverless functions
├── server/                # Backend server code
│   ├── emails/            # Email templates and service
│   ├── db.ts              # Database connection
│   ├── index.ts           # Express server setup
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database operations
│   └── vite.ts            # Vite server integration
└── shared/                # Shared code between frontend and backend
    └── schema.ts          # Database schema and types
```

## Deployment Architecture

The application is designed to be deployed with a split architecture:

1. **Backend (API)**: Deployed to Vercel
2. **Frontend**: Deployed to Netlify

This separation allows for better scalability, independent updates, and utilizes the strengths of each platform.

### Backend on Vercel

The backend consists of:

- Express.js server for API endpoints
- PostgreSQL database connection
- Email service for notifications
- Authentication logic

Key files for Vercel deployment:
- `api/index.ts`: The serverless entry point
- `vercel.json`: Configuration for Vercel deployment
- `build-for-vercel.sh`: Build script for Vercel

### Frontend on Netlify

The frontend consists of:

- React application with hooks and components
- TanStack Query for API data fetching
- Tailwind CSS for styling
- React Router for navigation

Key files for Netlify deployment:
- `netlify.toml`: Configuration for Netlify deployment
- `build-for-netlify.sh`: Build script for Netlify
- `netlify/functions/api-standalone.cjs`: Optional serverless backend if not using Vercel

## Communication Between Frontend and Backend

When deployed separately, the frontend and backend communicate via HTTP requests:

1. The frontend makes API calls to endpoints defined in the backend
2. The backend processes these requests and returns responses
3. The `client/src/lib/queryClient.ts` file handles the connection logic and resolves the correct API URL based on the environment

Key aspects of this communication:

- In production, API requests are routed to the Vercel backend via the `VITE_API_URL` environment variable
- CORS headers are configured to allow cross-origin requests between the frontend and backend
- Authentication state is maintained using cookies or tokens

## Configuration for Split Deployment

To enable the split deployment architecture, several configurations are in place:

1. **CORS Configuration**: 
   - The backend has CORS headers configured to accept requests from the frontend domain
   - Both `api/index.ts` and `netlify/functions/api-standalone.cjs` include these settings

2. **API URL Resolution**:
   - The `getApiUrl` function in `client/src/lib/queryClient.ts` determines the correct API URL
   - In production, it uses the `VITE_API_URL` environment variable to target the Vercel backend

3. **Environment Variables**:
   - `DATABASE_URL`: PostgreSQL connection string (set on Vercel)
   - `SESSION_SECRET`: Secret for session encryption (set on Vercel)
   - `VITE_API_URL`: URL of the Vercel backend API (set on Netlify)

## Advantages of This Architecture

1. **Scalability**: Each part can scale independently based on demand
2. **Deployment Flexibility**: Updates to frontend or backend can be deployed separately
3. **Performance**: Static frontend assets are served from Netlify's CDN
4. **Cost-Effective**: Takes advantage of generous free tiers on both platforms
5. **Specialization**: Uses each platform for what it does best (Netlify for static hosting, Vercel for serverless functions)

## Deployment Process

For detailed deployment steps, refer to the `DEPLOYMENT_GUIDE.md` file in the project root.