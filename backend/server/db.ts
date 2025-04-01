import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Database connection configuration
const connectionString = process.env.DATABASE_URL;

// Create a connection pool optimized for serverless
let pool: Pool;

if (connectionString) {
  // Connection pooling settings for serverless environment
  pool = new Pool({
    connectionString,
    max: 10, // Adjust based on expected load
    idleTimeoutMillis: 30000, // Close idle connections after 30 seconds
    connectionTimeoutMillis: 5000, // Timeout after 5 seconds
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined
  });
} else {
  console.error('DATABASE_URL environment variable is not set');
  // In a serverless context, we should throw an error here
  throw new Error('Database connection string not provided');
}

// Create Drizzle ORM instance
export const db = drizzle(pool);

// Function to apply migrations (can be used during deployment)
export async function runMigrations() {
  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error applying migrations:', error);
    throw error;
  }
}

// Function to test database connection
export async function testConnection() {
  try {
    const result = await pool.query('SELECT 1 as test');
    if (result.rows[0].test === 1) {
      console.log('Database connection successful');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}