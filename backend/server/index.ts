import express, { Express, Request, Response, NextFunction } from 'express';
import session from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import cors from 'cors';
import dotenv from 'dotenv';
import { HttpServer } from 'http';
import { storage } from './storage';
import { testConnection, runMigrations } from './db';
import { registerRoutes } from './routes';
import { emailService } from './emails/emailService';

// Load environment variables
dotenv.config();

// Flag to track database connection status
let dbConnected = false;

/**
 * Create and configure the Express application
 */
function createExpressApp() {
  const app = express();
  
  // Parse JSON and URL-encoded bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  
  // Configure CORS
  const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204,
  };
  app.use(cors(corsOptions));
  
  // Configure session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'klede-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );
  
  // Configure Passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure LocalStrategy
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return done(null, false, { message: 'Incorrect username' });
        }
        
        // In production, we would compare hashed passwords
        if (user.password !== password) {
          return done(null, false, { message: 'Incorrect password' });
        }
        
        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );
  
  // Serialize and deserialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  
  // Error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
      message: err.message || 'Something went wrong',
      error: process.env.NODE_ENV === 'development' ? err : {},
    });
  });
  
  return app;
}

/**
 * Create and start the server
 * @param options Options for server creation
 */
export async function createServer(options = { serverless: false }) {
  // Create Express app
  const app = createExpressApp();
  
  // Initialize email service
  await emailService.initialize();
  
  // Test database connection
  dbConnected = await testConnection();
  
  if (dbConnected) {
    // Run migrations to create/update tables
    await runMigrations();
    
    // Register API routes
    const httpServer = await registerRoutes(app);
    
    // Health check route
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
  
  return { app, server: null };
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