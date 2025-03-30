import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import serverless from 'serverless-http';
import express from 'express';
import { registerRoutes } from '../../server/routes';

// Create a serverless handler for Netlify Functions
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Create Express app
  const app = express();
  
  // Configure CORS for Netlify environment
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });
  
  // Parse JSON bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  // Register API routes
  await registerRoutes(app);
  
  // Create serverless handler
  const handlerFunction = serverless(app);
  
  // Process the request and convert to Netlify Function response format
  const response = await handlerFunction(event, context);
  
  // Make sure we return in the format expected by Netlify Functions
  return {
    statusCode: response.statusCode || 200,
    body: response.body || '',
    headers: response.headers || {}
  };
};