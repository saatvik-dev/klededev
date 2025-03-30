import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

// Configure pool with SSL for production environments
const poolConfig: pg.PoolConfig = {
  connectionString: process.env.DATABASE_URL,
};

// Add SSL configuration for production environments
if (process.env.NODE_ENV === 'production') {
  poolConfig.ssl = {
    rejectUnauthorized: false // Required for some providers like Heroku
  };
}

const pool = new pg.Pool(poolConfig);

export const db = drizzle(pool);
