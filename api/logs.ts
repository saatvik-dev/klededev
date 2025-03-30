// Special endpoint to view logs in Vercel environment
// Access at: /api/logs (with proper authentication)

import { Request, Response } from 'express';
import { storage } from '../server/storage';

// In-memory log storage for Vercel functions
const MAX_LOGS = 100;
const logs: { timestamp: Date; message: string; level: string; }[] = [];

// Export a global log function
export function vercelLog(message: string, level: 'info' | 'error' | 'warn' = 'info') {
  const entry = { timestamp: new Date(), message, level };
  logs.push(entry);
  
  // Keep logs limited to prevent memory issues
  if (logs.length > MAX_LOGS) {
    logs.shift();
  }
  
  // Also log to console
  console[level](message);
}

// Logs endpoint handler
export default async function handler(req: Request, res: Response) {
  // Only allow in development or with admin authentication
  if (process.env.NODE_ENV !== 'production' || req.query.secret === process.env.SESSION_SECRET) {
    return res.status(200).json({
      logs,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : 'Not set'
      },
      timestamp: new Date().toISOString()
    });
  }
  
  // Check if user is admin
  try {
    const session = req.session as any;
    if (session && session.isAdmin) {
      return res.status(200).json({
        logs,
        environment: {
          NODE_ENV: process.env.NODE_ENV,
          VERCEL: process.env.VERCEL,
          DATABASE_URL: process.env.DATABASE_URL ? '[REDACTED]' : 'Not set'
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    // Continue to auth failure
  }
  
  return res.status(401).json({ error: 'Unauthorized' });
}