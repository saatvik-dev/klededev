import express, { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import cors from 'cors';
import http, { Server as HttpServer } from 'http';
import * as dotenv from 'dotenv';

import { db, testConnection } from './db.js';
import { registerRoutes } from './routes.js';
import { storage } from './storage.js';

// Load environment variables
dotenv.config();

interface ServerOptions {
  serverless?: boolean;
  rootDir?: string;
}

/**
 * Create and configure the Express application
 */
function createExpressApp() {
  const app = express();
  
  // Body parser middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // CORS configuration - needed for cross-domain requests
  const corsOptions = {
    origin: process.env.CORS_ALLOWED_ORIGINS ? 
      process.env.CORS_ALLOWED_ORIGINS.split(',') : 
      (process.env.NODE_ENV === 'production' ? false : '*'),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  app.use(cors(corsOptions));
  
  // Session configuration
  const sessionSecret = process.env.SESSION_SECRET || 'dev-session-secret';
  if (process.env.NODE_ENV === 'production' && sessionSecret === 'dev-session-secret') {
    console.warn('WARNING: Using default session secret in production. Set SESSION_SECRET environment variable.');
  }
  
  app.use(
    session({
      secret: sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    })
  );
  
  // Passport configuration for admin authentication
  app.use(passport.initialize());
  app.use(passport.session());
  
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        
        // In a real app, use proper password hashing and comparison
        if (user.password !== password) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
  
  // Error handling middleware
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
  });
  
  return app;
}

/**
 * Create and start the server
 * @param options Options for server creation
 */
export async function createServer(options: ServerOptions = { serverless: false }) {
  const app = createExpressApp();
  
  // Register API routes
  const httpServer = await registerRoutes(app);
  
  if (!options.serverless) {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('Database connection failed. Server may not function correctly.');
    }
    
    // Health check endpoint
    app.get('/api/health', (_req, res) => {
      res.status(200).json({ status: 'ok', dbConnected });
    });
    
    // Start the server if not in serverless mode
    const port = parseInt(process.env.PORT || '3001', 10);
    const server = httpServer || app.listen(port, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${port}`);
    });
    
    return { app, server };
  }
  
  return { app, server: httpServer };
}

// Start the server if this file is run directly
if (require.main === module) {
  createServer().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
}

// For serverless environments (Vercel), export the app
module.exports = createServer({ serverless: true }).then(({ app }) => app);