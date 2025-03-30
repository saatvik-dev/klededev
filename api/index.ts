// Serverless function entry point for Vercel
import express, { Request, Response, NextFunction } from 'express';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/vite';
import session from 'express-session';
import MemoryStore from 'memorystore';

// Set VERCEL environment flag
process.env.VERCEL = 'true';
// Ensure NODE_ENV is set to production
process.env.NODE_ENV = 'production';

// Create session store
const SessionStore = MemoryStore(session);

// Set up Express app
const app = express();

// Add CORS headers for Vercel deployment
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[Vercel] ${req.method} ${req.url}`);
  next();
});

// Enable JSON parsing - place BEFORE session to ensure cookies can be parsed
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Configure session
app.use(
  session({
    secret: process.env.SESSION_SECRET || "klede-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Secure in production
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
    store: new SessionStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
  })
);

// Special direct API handling for critical paths
app.post('/api/waitlist', express.json(), async (req, res, next) => {
  try {
    console.log('[Vercel] Direct waitlist API call detected');
    // Let the regular routes handle this
    next();
  } catch (err) {
    next(err);
  }
});

// Special case for root API access
app.get('/api', (req, res) => {
  res.json({
    status: 'API is running',
    time: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL === 'true' ? true : false
    }
  });
});

// Initialize routes with better error handling
let routesRegistered = false;
const initializeRoutesPromise = registerRoutes(app)
  .then(() => {
    routesRegistered = true;
    console.log('[Vercel] Routes registered successfully');
  })
  .catch(err => {
    console.error("[Vercel] Error registering routes:", err);
  });

// Serve static files for non-API routes
serveStatic(app);

// Express error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[Vercel] Error:", err.stack || err);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Create a special handler for Vercel's serverless environment
const handler = async (req: Request, res: Response) => {
  try {
    // Wait for routes to be registered on first invocation
    if (!routesRegistered) {
      console.log('[Vercel] Waiting for routes to be registered...');
      await initializeRoutesPromise;
    }
    
    // Handle the request with the Express app
    return app(req, res);
  } catch (error) {
    console.error('[Vercel] Unhandled error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Export handler for Vercel
export default handler;

// Also export the app for testing
export { app };