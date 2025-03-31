# Frontend Structure

This document provides an overview of the frontend structure for the Klede Waitlist application, which is designed to be deployed to Netlify.

## Directory Structure

```
klede-waitlist/
├── client/                # Frontend application code
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── ui/        # Shadcn UI components
│   │   │   ├── AdminDashboard.tsx  # Admin interface
│   │   │   ├── FeaturedCollections.tsx  # Collections display
│   │   │   ├── KledeLogo.tsx  # Logo component
│   │   │   └── WaitlistCard.tsx  # Signup form
│   │   ├── hooks/         # Custom React hooks
│   │   │   ├── use-mobile.tsx  # Mobile detection hook
│   │   │   └── use-toast.ts  # Toast notifications
│   │   ├── lib/           # Utility functions
│   │   │   ├── queryClient.ts  # API request handling
│   │   │   ├── supabase.ts  # Database operations
│   │   │   └── utils.ts  # Helper utilities
│   │   ├── pages/         # Page components
│   │   │   ├── Admin.tsx  # Admin dashboard page
│   │   │   ├── Home.tsx  # Landing page
│   │   │   └── not-found.tsx  # 404 page
│   │   ├── App.tsx        # Main application component and routing
│   │   └── main.tsx       # Application entry point
│   └── index.html         # HTML template
└── netlify/               # Netlify-specific configurations
    ├── functions/         # Netlify serverless functions
    └── ...
```

## Key Components

### Main Application Structure

- **App.tsx**: Defines the main application structure and routing using Wouter
- **main.tsx**: Entry point that renders the App component and sets up providers

### Pages

The application has several main pages:

- **Home.tsx**: The main landing page with waitlist signup form and featured collections
- **Admin.tsx**: Admin dashboard for managing waitlist entries and sending emails
- **not-found.tsx**: 404 page for invalid routes

### UI Components

The `components/` directory contains reusable UI elements:

- **ui/**: Contains Shadcn UI components like buttons, forms, toasts, etc.
- **AdminDashboard.tsx**: Dashboard UI for administrators
- **FeaturedCollections.tsx**: Displays featured fashion collections
- **WaitlistCard.tsx**: The waitlist signup form
- **KledeLogo.tsx**: Logo component

### Hooks and Utilities

- **hooks/use-mobile.tsx**: Hook for detecting mobile devices
- **hooks/use-toast.ts**: Hook for displaying toast notifications
- **lib/queryClient.ts**: Setup for API requests using TanStack Query
- **lib/supabase.ts**: Functions for interacting with the backend
- **lib/utils.ts**: Utility functions used throughout the application

## API Communication

The frontend communicates with the backend through the functions in `lib/supabase.ts` which include:

- **addToWaitlist**: Add an email to the waitlist
- **loginAdmin**: Authenticate as an admin
- **logoutAdmin**: Log out from admin session
- **getAllWaitlistEntries**: Get all waitlist entries
- **deleteWaitlistEntry**: Remove an entry from the waitlist
- **checkAdminAuth**: Check if user is authenticated as admin
- **sendPromotionalEmail**: Send promotional emails to waitlist
- **sendLaunchAnnouncement**: Send launch announcement to waitlist

These functions use the `apiRequest` utility from `lib/queryClient.ts` which handles the actual HTTP requests.

## Routing

The application uses Wouter for routing. The main routes are:

- `/`: Home page with waitlist signup
- `/admin`: Admin dashboard (requires authentication)
- `*`: Catches all other routes and shows 404 page

## State Management

The application primarily uses React's built-in state management with:

- **useState**: For component-level state
- **useEffect**: For side effects and data fetching
- **TanStack Query**: For API data fetching and caching

## Forms

Forms are implemented using:

- **react-hook-form**: For form state management
- **zod**: For form validation
- **@hookform/resolvers/zod**: To connect Zod schemas to react-hook-form

## Styling

The application uses:

- **Tailwind CSS**: For utility-based styling
- **Shadcn UI**: For pre-built UI components
- **class-variance-authority**: For component variants

## Deployment to Netlify

For deployment to Netlify, the project includes:

- **netlify.toml**: Configuration file for Netlify deployment
- **build-for-netlify.sh**: Build script that prepares the application for Netlify

The `build-for-netlify.sh` script:

1. Installs dependencies
2. Builds the client application
3. Prepares Netlify functions directories
4. Handles database migrations if needed

## Environment Variables

The frontend relies on these environment variables in production:

- **VITE_API_URL**: The URL of the backend API (on Vercel)

This variable is used in `lib/queryClient.ts` to determine where to send API requests in production.