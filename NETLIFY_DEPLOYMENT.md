# Deploying to Netlify

This guide provides step-by-step instructions for deploying the Klede Waitlist application to Netlify.

## Prerequisites

1. A Netlify account - [Sign up here](https://app.netlify.com/signup) if you don't have one.
2. Netlify CLI installed - Install with `npm install -g netlify-cli`.
3. A PostgreSQL database for production (options listed below).

## Setup PostgreSQL Database

You'll need a PostgreSQL database for the production deployment. Here are some options:

- [Neon](https://neon.tech) - Serverless Postgres with a generous free tier
- [Supabase](https://supabase.com) - Open source Firebase alternative with Postgres
- [Render](https://render.com) - Managed Postgres service

Once you've created your database, make sure to save the connection string (DATABASE_URL). You'll need it during deployment.

## Deployment Steps

### 1. Run the Deployment Helper

The project includes a deployment helper script that will guide you through the process:

```bash
node deploy.js
```

### 2. Create a Netlify Site

If you haven't already connected your repository to Netlify:

```bash
netlify login
netlify deploy
```

When prompted, choose "Create & configure a new site".

### 3. Configure Environment Variables

Set up the required environment variables in Netlify:

```bash
netlify env:set DATABASE_URL "your_postgres_connection_string"
netlify env:set SESSION_SECRET "your_secure_random_string"
```

You can generate a secure random string for SESSION_SECRET with a password generator.

### 4. Deploy to Production

Deploy your site to production:

```bash
netlify deploy --prod
```

### 5. Set Up Database Schema

After deployment, push your database schema:

```bash
npm run db:push
```

## Troubleshooting

### Database Connection Issues

If you encounter database connection issues:

1. Verify your DATABASE_URL is correctly set in Netlify environment variables.
2. Ensure the database is accessible from Netlify servers (check firewall rules).
3. If using Neon or similar services, check that your IP or connection pooling is properly configured.

### Deployment Failures

If deployment fails:

1. Check the Netlify build logs for specific errors.
2. Ensure all dependencies are correctly specified in package.json.
3. Verify the Netlify configuration in netlify.toml is correct.

## Email Functionality

Note that email functionality has been removed from this application. If you need to add email capabilities in the future, consider these services:

- [SendGrid](https://sendgrid.com)
- [Mailgun](https://www.mailgun.com)
- [Amazon SES](https://aws.amazon.com/ses/)

## Additional Resources

- [Netlify Documentation](https://docs.netlify.com)
- [Drizzle ORM Documentation](https://orm.drizzle.team)
- [Neon Documentation](https://neon.tech/docs)
- [Supabase Documentation](https://supabase.com/docs)