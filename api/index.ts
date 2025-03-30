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

// Simple express app for serverless
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

// Add direct request emergency handling
app.use((req, res, next) => {
  // Add original URL to req for debugging
  const originalUrl = req.url;
  console.log(`[Vercel Handler] ${req.method} ${originalUrl}`);
  
  // Special handling for direct API calls to specific paths
  if (req.method === 'POST' && (originalUrl === '/api/waitlist' || originalUrl === '/api/submit-email')) {
    try {
      const body = req.body;
      if (body && body.email && typeof body.email === 'string' && body.email.includes('@')) {
        // This will be handled by the regular route handler
        console.log(`[Vercel Handler] Direct waitlist submission detected for: ${body.email}`);
      }
    } catch (e) {
      console.error('[Vercel Handler] Error pre-processing request:', e);
    }
  }
  
  next();
});

// Enable JSON parsing
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize routes
registerRoutes(app).catch(err => {
  console.error("[Vercel Handler] Error registering routes:", err);
});

// Serve static files for non-API routes
serveStatic(app);

// Express error handling
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error("[Vercel Handler] Error:", err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Create a special handler for Vercel's serverless environment
const handler = async (req: Request, res: Response) => {
  try {
    // Log the request
    console.log(`[Vercel Function] ${req.method} ${req.url}`);
    
    // Handle the request with the Express app
    return app(req, res);
  } catch (error) {
    console.error('[Vercel Function] Unhandled error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

// Vercel serverless handler
export default handler;