# Klede Waitlist Application

A sleek, minimalist waitlist platform designed for exclusive collection access.

## Features

- User-friendly waitlist signup form
- Admin panel for managing waitlist entries
- Custom email notifications
- Responsive design

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Email Service**: Nodemailer

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   DATABASE_URL=postgresql://username:password@localhost:5432/database
   SESSION_SECRET=your_session_secret
   ```
4. Push the database schema:
   ```
   npm run db:push
   ```
5. Start the development server:
   ```
   npm run dev
   ```

## Deployment

This project is configured for easy deployment to both Netlify and Vercel.

### Deploy to Netlify

1. Install the Netlify CLI:
   ```
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```
   netlify login
   ```

3. Initialize your Netlify site:
   ```
   netlify init
   ```

4. Build the project for Netlify:
   ```
   ./build-for-netlify.sh
   ```

5. Deploy to Netlify:
   ```
   netlify deploy --prod
   ```

6. Set up environment variables:
   ```
   netlify env:set DATABASE_URL "your-database-connection-string"
   netlify env:set SESSION_SECRET "your-random-session-secret"
   netlify env:set NODE_ENV "production"
   ```

7. Push the database schema:
   ```
   npm run db:push
   ```

For detailed Netlify deployment instructions, refer to [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md).

### Deploy to Vercel (Optimized under 3MB)

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy to Vercel with automatic size optimization:
   ```
   vercel --prod
   ```

4. Set up environment variables:
   ```
   vercel env add DATABASE_URL
   vercel env add SESSION_SECRET
   vercel env add NODE_ENV
   ```

5. Initialize your database:
   ```
   curl -X GET "https://your-project-name.vercel.app/api/db-migrate?secret=YOUR_SESSION_SECRET"
   ```

For detailed Vercel deployment instructions, refer to:
- [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md) - Complete deployment guide
- [VERCEL_SIZE_OPTIMIZATION.md](VERCEL_SIZE_OPTIMIZATION.md) - How we keep the app under Vercel's 3MB limit

## Admin Access

Access the admin panel at `/admin` with the following credentials:

- Username: `admin`
- Password: `admin`

> ⚠️ **Important**: Change the default admin credentials for production use.

## License

MIT