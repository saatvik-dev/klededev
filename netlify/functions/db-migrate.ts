import { Handler } from '@netlify/functions';
import { db } from '../../server/db';
import * as schema from '../../shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';

// Database migration handler for Netlify
export const handler: Handler = async (event) => {
  try {
    console.log('Starting database migration...');
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    // Create a connection pool
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    
    // Initialize Drizzle
    const migrationDb = drizzle(pool);
    
    // Run migrations
    await migrate(migrationDb, { migrationsFolder: './drizzle' });
    
    console.log('Migration completed successfully');
    
    // Close the connection
    await pool.end();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Database migration completed successfully' }),
    };
  } catch (error) {
    console.error('Migration error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Migration failed: ${error.message}` }),
    };
  }
};