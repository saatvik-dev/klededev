# Klede Waitlist Platform

A sleek, minimalist waitlist platform designed for exclusive collection access, offering smooth and engaging user interactions.

## Tech Stack

- React.js frontend with advanced UI interactions
- Supabase backend for robust data management
- Tailwind CSS for responsive styling
- TypeScript for type safety
- GitHub Pages static deployment option
- Netlify/Vercel serverless functions support

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5000`

## Deploying to GitHub Pages

This project can be deployed as a static site to GitHub Pages with the following steps:

### Method 1: Automated Deployment

Use our automated deployment script which handles everything for you:

```
node deploy-to-github.js
```

This script will:
1. Check if Git is initialized
2. Ask for your GitHub repository URL if not already configured
3. Build the static site with the correct base path
4. Deploy it to GitHub Pages automatically

### Method 2: Manual Deployment

If you prefer a more manual approach:

1. Build the static version of the site:
   ```
   node build-gh-pages.js
   ```
2. Deploy to GitHub Pages:
   ```
   npx gh-pages -d dist/public
   ```

### Method 3: GitHub Actions

This repository includes a GitHub Actions workflow file (`.github/workflows/github-pages.yml`) that will automatically deploy the site to GitHub Pages whenever you push to the main branch.

To use it:
1. Push your code to GitHub
2. Go to your repository's Settings tab
3. Navigate to Pages
4. Select "GitHub Actions" as the source
5. Your site will be automatically deployed with each push to main

### Demo Mode on GitHub Pages

When running on GitHub Pages, the application operates in a "static demo mode" with the following features:

- In-memory data storage (changes will be lost on page refresh)
- Admin login is available with username: `admin` and password: `admin`
- Email functionality is simulated (no actual emails are sent)

## Admin Features

1. Login at `/admin` with credentials
2. View all waitlist entries
3. Send promotional emails
4. Send launch announcement emails
5. Delete waitlist entries

## Technical Implementation

### GitHub Pages Deployment Architecture

To make this dynamic application work in GitHub Pages' static hosting environment, the following adaptations were made:

1. **Static Data Service**: 
   - Created a client-side data store in `client/src/lib/staticData.ts` to simulate backend API responses
   - Implemented mock versions of all API endpoints with proper response structures

2. **API Request Routing**:
   - Modified `client/src/lib/queryClient.ts` to detect GitHub Pages environments
   - Added conditional logic to route API requests to the static data service when on GitHub Pages

3. **Base Path Handling**:
   - Added support for repository-based URLs in `vite.config.static.ts`
   - Implemented base path adjustment in the React Router component
   - Created a 404.html redirect for SPA routing

4. **Build Configuration**:
   - Created a dedicated static build configuration
   - Added path resolution for GitHub Pages subdirectory hosting

### Deployment Options

- **GitHub Pages** - For showcasing the UI and static demo functionality
- **Netlify/Vercel** - For full dynamic functionality with serverless backend
- **Self-Hosted** - For complete control with Express backend