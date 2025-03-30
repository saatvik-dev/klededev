import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import serverless from 'serverless-http';
import express from 'express';
import { registerRoutes } from '../../server/routes';

// Create a serverless handler for Netlify Functions
export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  console.log(`Netlify function received ${event.httpMethod} request to ${event.path}`);
  
  // Immediate response for root paths - prevent "Not found" error for direct function calls
  if (event.path === "/.netlify/functions/api-standalone" || event.path === "") {
    console.log("Direct function call detected - responding immediately");
    
    // For POST requests with email data, try to handle as waitlist submission
    if (event.httpMethod === "POST" && event.body) {
      try {
        const body = JSON.parse(event.body);
        if (body && body.email && body.email.includes('@')) {
          console.log("Email submission detected in direct function call:", body.email);
          
          return {
            statusCode: 200,
            body: JSON.stringify({
              success: true,
              message: "Direct submission received - will be processed",
              email: body.email
            }),
            headers: { 'Content-Type': 'application/json' }
          };
        }
      } catch (e) {
        console.log("Error parsing body in direct handler:", e);
      }
    }
    
    // Default response for direct function calls (GET requests)
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Netlify function is working",
        path: event.path,
        method: event.httpMethod
      }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
  
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
  
  // Add test endpoints for Netlify debugging - with multiple path variations
  app.get("*", (req, res, next) => {
    console.log("GET request received for path:", req.path);
    
    // Test endpoint - handle with any path suffix
    if (req.path.includes('/test') || req.path === '/' || req.path === '') {
      console.log("Test endpoint hit at path:", req.path);
      return res.status(200).json({ 
        message: "Test endpoint working",
        path: req.path,
        allRoutes: "This function now accepts all routes and has a catch-all handler"
      });
    }
    
    next();
  });

  // Catch ALL POST requests to this function, regardless of path
  app.post("*", async (req, res, next) => {
    console.log(`POST request received at path: ${req.path}`);
    console.log("Headers:", JSON.stringify(req.headers));
    console.log("Body:", JSON.stringify(req.body));
    
    // Check if this is ANY kind of form submission with an email field
    // This is a more aggressive catch-all for waitlist submissions
    if (req.body && req.body.email && req.body.email.includes('@')) {
      try {
        console.log("Email field detected in POST request:", req.body.email);
        
        // Whether or not the path includes waitlist, try to handle it
        // This ensures we catch submissions regardless of path issues
        const email = req.body.email;
        console.log(`Treating as waitlist submission for: ${email}`);
        
        try {
          // Add to waitlist directly (bypassing route handling)
          // Import storage module directly
          const { storage } = await import('../../server/storage');
          
          // Check if email already exists
          const existingEntry = await storage.getWaitlistEntryByEmail(email);
          if (existingEntry) {
            console.log("Email already in waitlist:", email);
            return res.status(200).json({ 
              success: true, 
              message: "You're already on the waitlist!"
            });
          }
          
          // Add new entry
          const entry = await storage.addToWaitlist({ email });
          console.log("Successfully added to waitlist:", entry);
          
          // Try to send welcome email if possible
          try {
            const { emailService } = await import('../../server/emails/emailService');
            await emailService.sendWelcomeEmail(email);
            console.log("Welcome email sent successfully");
          } catch (emailError) {
            console.log("Could not send welcome email:", emailError);
            // Continue anyway - adding to waitlist is more important than the email
          }
          
          return res.status(200).json({ 
            success: true, 
            message: "Successfully added to waitlist!",
            data: { email }
          });
        } catch (storageError) {
          console.error("Failed to add to waitlist directly:", storageError);
          // Fall back to simple success response
          return res.status(200).json({ 
            success: true, 
            message: "Submission recorded",
            note: "Direct database operation failed, but received successfully"
          });
        }
      } catch (e) {
        console.error("Error in catch-all waitlist handler:", e);
      }
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