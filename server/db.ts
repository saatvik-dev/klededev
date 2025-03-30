import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// Initialize database connection with better error handling for Vercel
const createDbConnection = () => {
  try {
    console.log('[Database] Initializing database connection');
    
    // Get connection string from environment
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.error('[Database] Missing DATABASE_URL environment variable');
      throw new Error('DATABASE_URL environment variable is required');
    }
    
    // Configure connection pool
    const poolConfig: pg.PoolConfig = {
      connectionString,
      // Use connection timeout to prevent hanging in serverless environment
      connectionTimeoutMillis: 5000, 
      // Limit pool size in serverless environment
      max: 10, 
      // Idle timeout to close unused connections
      idleTimeoutMillis: 30000,
    };
    
    // Add SSL for production environments
    if (process.env.NODE_ENV === "production") {
      poolConfig.ssl = {
        rejectUnauthorized: false, // Required for some providers like Heroku/Neon/Supabase
      };
      console.log('[Database] SSL enabled for production database connection');
    }
    
    // Create and return the pool
    const pool = new pg.Pool(poolConfig);
    
    // Test the connection
    pool.on('error', (err) => {
      console.error('[Database] Unexpected database error:', err);
    });
    
    // Add logging for connection events in Vercel
    if (process.env.VERCEL === 'true') {
      console.log('[Database] Vercel environment detected, configuring for serverless');
      
      // Log successful connections
      pool.on('connect', () => {
        console.log('[Database] New connection established');
      });
      
      // Log when connections are released back to the pool
      pool.on('release', () => {
        console.log('[Database] Connection released back to pool');
      });
    }
    
    return pool;
  } catch (error) {
    console.error('[Database] Failed to initialize database:', error);
    throw error;
  }
};

// Create the connection pool
const pool = createDbConnection();

// Create and export the drizzle instance
export const db = drizzle(pool);
