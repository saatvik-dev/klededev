import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { users, waitlistEntries } from '@shared/schema';

// Create a database pool for PostgreSQL
let pool: Pool;

// Initialize the database connection
try {
  // Check if DATABASE_URL is available (production/staging)
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    console.log('Database connection initialized with connection string');
  } else {
    // Local development with individual connection parameters
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'klede',
    });
    console.log('Database connection initialized with individual parameters');
  }
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  throw error;
}

// Initialize Drizzle ORM with the database pool
export const db = drizzle(pool);

// Create tables if they don't exist
export async function runMigrations() {
  try {
    // Check if users table exists
    const usersExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);

    // Check if waitlist_entries table exists
    const waitlistExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'waitlist_entries'
      );
    `);

    // Create the tables using Drizzle's schema definitions if they don't exist
    if (!usersExists.rows[0].exists) {
      console.log('Creating users table...');
      await db.execute(sql`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          is_admin BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
    }

    if (!waitlistExists.rows[0].exists) {
      console.log('Creating waitlist_entries table...');
      await db.execute(sql`
        CREATE TABLE waitlist_entries (
          id SERIAL PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT,
          referral_source TEXT,
          has_received_welcome_email BOOLEAN NOT NULL DEFAULT FALSE,
          subscriber_count INTEGER NOT NULL DEFAULT 0,
          created_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);
    }

    console.log('Database schema check completed.');

    // Create a default admin user if it doesn't exist
    const adminExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM users 
        WHERE username = 'admin'
      );
    `);

    if (!adminExists.rows[0].exists) {
      console.log('Creating default admin user...');
      await db.insert(users).values({
        username: 'admin',
        password: 'admin', // In production, this should be hashed
        isAdmin: true,
      });
    }

    return true;
  } catch (error) {
    console.error('Error running migrations:', error);
    return false;
  }
}

// Test the database connection
export async function testConnection() {
  try {
    const result = await db.execute(sql`SELECT NOW();`);
    console.log('Database connection test successful:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Helper to generate SQL queries
function sql(strings: TemplateStringsArray, ...values: any[]) {
  return {
    text: strings.reduce((acc, str, i) => acc + str + (i < values.length ? '$' + (i + 1) : ''), ''),
    values,
  };
}