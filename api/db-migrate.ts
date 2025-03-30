// Database migration script for Vercel environments
// Can be called to initialize or reset the database schema

import { Request, Response } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../server/db';

export default async function handler(req: Request, res: Response) {
  // Security check - only allow with authorization
  if (process.env.NODE_ENV === 'production' && 
      req.query.secret !== process.env.SESSION_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    console.log('[DB Migrate] Starting database migration...');
    
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[DB Migrate] Users table created/verified');
    
    // Create waitlist_entries table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS waitlist_entries (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('[DB Migrate] Waitlist entries table created/verified');
    
    // Create default admin user (if it doesn't exist)
    await db.execute(sql`
      INSERT INTO users (username, password, role)
      VALUES ('admin', 'admin123', 'admin')
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log('[DB Migrate] Default admin user created/verified');
    
    return res.status(200).json({
      success: true,
      message: 'Database migration completed successfully'
    });
  } catch (error) {
    console.error('[DB Migrate] Error during migration:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'production' ? undefined : error instanceof Error ? error.stack : undefined
    });
  }
}