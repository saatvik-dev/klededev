import { Handler } from '@netlify/functions';
import * as schema from '../../shared/schema';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Database migration handler for Netlify
export const handler: Handler = async (event) => {
  console.log('Starting database migration...');
  
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: 'Migration failed: DATABASE_URL environment variable is not set',
        hint: 'Set the DATABASE_URL environment variable in your Netlify dashboard'
      }),
    };
  }
  
  let pool;
  try {
    console.log('Connecting to database...');
    
    // Create a connection pool
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    
    // Test the connection
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
    
    // Initialize Drizzle
    const db = drizzle(pool);
    
    // Create tables directly using SQL (more reliable than migrate in Netlify functions)
    console.log('Creating database tables if they do not exist...');
    
    // Create tables using the pool directly to avoid type errors
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS waitlist_entries (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Seed admin user if not exists (using environment variables or defaults)
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    await pool.query(`
      INSERT INTO users (username, password, role)
      VALUES ($1, $2, 'admin')
      ON CONFLICT (username) DO NOTHING;
    `, [adminUsername, adminPassword]);
    
    console.log('Database setup completed successfully');
    
    // Close the connection
    await pool.end();
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        message: 'Database migration completed successfully',
        tables: ['users', 'waitlist_entries'],
        adminUser: adminUsername
      }),
    };
  } catch (error) {
    console.error('Migration error:', error);
    
    try {
      // Detailed error logging
      const errorDetails = {
        message: error.message,
        stack: error.stack,
        code: error.code,
        databaseUrl: process.env.DATABASE_URL ? 
          `${process.env.DATABASE_URL.split('@')[0].split(':')[0]}:****@${process.env.DATABASE_URL.split('@')[1]}` : 
          'not set'
      };
      
      console.error('Error details:', JSON.stringify(errorDetails, null, 2));
    } catch (e) {
      console.error('Error while logging error details:', e);
    }
    
    // Close pool if it exists
    if (pool) {
      try {
        await pool.end();
      } catch (e) {
        console.error('Error while closing connection pool:', e);
      }
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        message: `Migration failed: ${error.message}`,
        error: error.code || 'unknown',
        hint: 'Check that your DATABASE_URL is correct and the database is accessible from Netlify'
      }),
    };
  }
};