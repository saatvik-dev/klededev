import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import serverless from 'serverless-http';
import express from 'express';
import { registerRoutes } from '../../server/routes';

// Create a serverless handler for Netlify Functions
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log(`Netlify function received ${event.httpMethod} request to ${event.path}`);
  
  // Create Express app
  const app = express();
  
  // Configure CORS for Netlify environment
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      console.log('Handling OPTIONS request');
      return res.status(200).end();
    }
    
    console.log(`Express handling ${req.method} ${req.path}`);
    next();
  });
  
  // Parse JSON bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // Special middleware to log request body for debugging
  app.use((req, res, next) => {
    if (req.body && Object.keys(req.body).length > 0) {
      console.log('Request body:', req.body);
    }
    next();
  });
  
  // Log exact path to ensure routes match
  app.use((req, res, next) => {
    console.log(`Processing path: ${req.path}`);
    next();
  });
  
  // Add a specific test endpoint just for Netlify debugging
  app.get("/.netlify/functions/api-standalone/test", (req, res) => {
    console.log("Test endpoint hit");
    return res.status(200).json({ message: "Test endpoint working" });
  });

  // Catch ALL POST requests to this function, regardless of path
  app.post("*", (req, res, next) => {
    console.log(`POST request received at path: ${req.path}`);
    console.log("Headers:", JSON.stringify(req.headers));
    console.log("Body:", JSON.stringify(req.body));
    
    // Check if this looks like a waitlist submission
    if (req.body && req.body.email && (
        req.path.includes('/waitlist') || 
        req.path.includes('/api/waitlist'))
    ) {
      console.log("This appears to be a waitlist submission with email:", req.body.email);
      return res.status(200).json({ 
        message: "Waitlist form received via catch-all handler",
        email: req.body.email,
        path: req.path
      });
    }
    
    // Not a waitlist request, pass to next handler
    next();
  });
  
  // Register API routes
  await registerRoutes(app);
  
  // Fallback route for unmatched routes
  app.use((req, res) => {
    console.log(`No route matched for ${req.method} ${req.path}`);
    res.status(404).json({ error: "Not found", path: req.path });
  });
  
  // Create serverless handler
  const handlerFunction = serverless(app);
  
  try {
    // Process the request and convert to Netlify Function response format
    const response = await handlerFunction(event, context) as any;
    
    console.log(`Netlify function responding with status ${response.statusCode}`);
    
    // Make sure we return in the format expected by Netlify Functions
    return {
      statusCode: response.statusCode || 200,
      body: response.body || '',
      headers: response.headers || {}
    };
  } catch (error) {
    console.error('Error in serverless handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error', message: error.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};