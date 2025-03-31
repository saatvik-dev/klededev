# Klede Waitlist Application

A sleek, minimalist waitlist platform designed for exclusive collection access, offering smooth and engaging user interactions.

## Features

- User-friendly waitlist signup form
- Admin panel for managing waitlist entries
- Custom email notifications
- Responsive design
- Separate backend and frontend deployments

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Email Service**: Nodemailer
- **Deployment**: Vercel (backend) + Netlify (frontend)

## Project Structure

The application is designed with a clear separation between the backend and frontend:

- **Backend**: API endpoints, database operations, and email services (`api/` and `server/` directories)
- **Frontend**: React components, pages, and UI (`client/` directory)
- **Shared**: Common code like database schemas (`shared/` directory)

For detailed architecture information, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

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

This project is configured for deployment with a split architecture:

- **Backend**: Deployed to Vercel
- **Frontend**: Deployed to Netlify

This separation allows for better scalability, independent updates, and takes advantage of each platform's strengths.

### Deployment Guides

- For detailed instructions on deploying both parts, see [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- For Vercel-specific backend deployment: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- For Netlify-specific frontend deployment: [NETLIFY_DEPLOYMENT.md](NETLIFY_DEPLOYMENT.md)

## Documentation

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Backend Structure](docs/BACKEND_STRUCTURE.md)
- [Frontend Structure](docs/FRONTEND_STRUCTURE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)

## Admin Access

Access the admin panel at `/admin` with the following credentials:

- Username: `admin`
- Password: `admin`

> ⚠️ **Important**: Change the default admin credentials for production use.

## License

MIT