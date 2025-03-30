import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Create a function to setup the app instead of creating it at the top level
function createExpressApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // Add CORS headers for all deployments
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  });

  // Add request logging
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });
  
  return app;
}

// Create server setup function that can be called in different environments
export async function createServer(options = { serverless: false }) {
  // Create a new Express app for each server instance
  const app = createExpressApp();
  
  // Register API routes
  const server = await registerRoutes(app);

  // Add global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    console.error(err); // Log error instead of throwing
  });

  // In serverless environments, we don't need Vite setup
  if (options.serverless) {
    // In serverless, just serve static files if needed
    serveStatic(app);
  } else {
    // Setup Vite in development or serve static in production
    if (process.env.NODE_ENV !== "production") {
      // Only setup Vite if we have a server instance
      if (server) {
        await setupVite(app, server);
      } else {
        // Fallback to static serving if no server
        serveStatic(app);
      }
    } else {
      serveStatic(app);
    }
  }
  
  return { app, server };
}

// Run the server directly (not when imported as a module)
// Check if this module is being run directly
// Using require.main === module would be CJS syntax
// For ESM compatibility, we check if this is not being imported
if (process.env.TS_NODE_DEV === 'true' || process.argv[1]?.endsWith('server/index.ts')) {
  (async () => {
    const { app, server } = await createServer();
    
    // Start server when running directly (not in serverless environment)
    // Only attempt to listen if we have a server instance
    if (server) {
      const port = process.env.PORT || 5000;
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`serving on port ${port}`);
      });
    } else {
      log(`Server not created - possibly running in serverless mode`);
    }
  })();
}

// Create a default app for direct imports
// This is used by serverless functions
const defaultApp = createExpressApp();
export default defaultApp;
