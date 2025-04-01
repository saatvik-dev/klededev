import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

export default {
  schema: "./shared/schema.ts",
  driver: "pg",
  out: "./drizzle",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/klede",
  },
} satisfies Config;