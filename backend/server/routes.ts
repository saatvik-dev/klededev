import { Express, Request, Response } from "express";
import passport from "passport";
import { Server, createServer } from "http";
import { emailSchema, insertWaitlistSchema } from "@shared/schema.js";
import { storage } from "./storage.js";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { emailService } from "./emails/emailService.js";

// Extend Express Request type to include session data
declare module "express-session" {
  interface SessionData {
    isAdmin?: boolean;
  }
}

/**
 * Middleware to authenticate admin users
 */
const authenticateAdmin = (req: Request, res: Response, next: Function) => {
  // In serverless environment, skip authentication for now
  if (process.env.VERCEL) {
    return next();
  }
  
  if (req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
};

/**
 * Register all API routes
 * @param app Express application
 * @returns HTTP server instance if WebSocket is configured, otherwise null
 */
export async function registerRoutes(app: Express): Promise<Server | null> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Authentication routes - only in non-serverless environment
  if (!process.env.VERCEL) {
    // Admin login endpoint
    app.post("/api/auth/login", (req, res, next) => {
      passport.authenticate("local", (err: Error, user: any, info: any) => {
        if (err) {
          return next(err);
        }
        
        if (!user) {
          return res.status(401).json({ error: "Invalid credentials" });
        }
        
        req.logIn(user, (err) => {
          if (err) {
            return next(err);
          }
          
          // Set isAdmin flag in session
          req.session.isAdmin = true;
          
          return res.json({ success: true });
        });
      })(req, res, next);
    });
    
    // Logout endpoint
    app.post("/api/auth/logout", (req, res) => {
      req.logout((err) => {
        if (err) {
          return res.status(500).json({ error: "Logout failed" });
        }
        
        // Clear isAdmin flag
        req.session.isAdmin = false;
        
        // Destroy session
        req.session.destroy((err) => {
          if (err) {
            return res.status(500).json({ error: "Session destruction failed" });
          }
          res.json({ success: true });
        });
      });
    });
    
    // Authentication check endpoint
    app.get("/api/auth/check", (req, res) => {
      if (req.session.isAdmin) {
        return res.json({ isAuthenticated: true });
      }
      return res.json({ isAuthenticated: false });
    });
  }

  // Waitlist routes
  app.post("/api/waitlist", async (req, res) => {
    try {
      // Validate email
      const validatedData = emailSchema.parse(req.body);
      
      // Check if email already exists
      const existingEntry = await storage.getWaitlistEntryByEmail(validatedData.email);
      if (existingEntry) {
        return res.status(409).json({ 
          message: "This email is already on the waitlist" 
        });
      }
      
      // Add to waitlist
      const entry = await storage.addToWaitlist({
        email: validatedData.email
      });
      
      // Send welcome email (async - don't wait for it to complete)
      emailService.sendWelcomeEmail(validatedData.email)
        .then(() => {
          console.log(`Welcome email sent to ${validatedData.email}`);
        })
        .catch((error) => {
          console.error(`Error sending welcome email to ${validatedData.email}:`, error);
        });
      
      res.status(201).json({
        message: "Successfully added to waitlist",
        entry
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error adding to waitlist:", error);
        res.status(500).json({ message: "Failed to add to waitlist" });
      }
    }
  });

  // Admin routes
  app.get("/api/admin/waitlist", authenticateAdmin, async (req, res) => {
    try {
      const entries = await storage.getAllWaitlistEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error fetching waitlist entries:", error);
      res.status(500).json({ message: "Failed to fetch waitlist entries" });
    }
  });

  // Send promotional email to all waitlist subscribers (admin only)
  app.post("/api/admin/send-promotional", authenticateAdmin, async (req, res) => {
    try {
      const { message } = req.body;
      const entries = await storage.getAllWaitlistEntries();
      
      if (entries.length === 0) {
        return res.status(404).json({ message: "No waitlist entries found" });
      }

      // Send emails in parallel
      const emailPromises = entries.map(entry => 
        emailService.sendPromotionalEmail(entry.email, message)
          .catch(error => {
            console.error(`Error sending promotional email to ${entry.email}:`, error);
            return { error: true, email: entry.email };
          })
      );

      const results = await Promise.all(emailPromises);
      
      // Count successful emails
      const failedEmails = results.filter(result => result && result.error).map(result => result.email);
      const successCount = entries.length - failedEmails.length;

      res.json({ 
        message: `Promotional emails sent to ${successCount} of ${entries.length} subscribers`,
        failedEmails: failedEmails.length > 0 ? failedEmails : undefined
      });
    } catch (error) {
      console.error("Error sending promotional emails:", error);
      res.status(500).json({ message: "Failed to send promotional emails" });
    }
  });

  // Send launch announcement to all waitlist subscribers (admin only)
  app.post("/api/admin/send-launch-announcement", authenticateAdmin, async (req, res) => {
    try {
      const entries = await storage.getAllWaitlistEntries();
      
      if (entries.length === 0) {
        return res.status(404).json({ message: "No waitlist entries found" });
      }

      // Send emails in parallel
      const emailPromises = entries.map(entry => 
        emailService.sendLaunchEmail(entry.email)
          .catch(error => {
            console.error(`Error sending launch email to ${entry.email}:`, error);
            return { error: true, email: entry.email };
          })
      );

      const results = await Promise.all(emailPromises);
      
      // Count successful emails
      const failedEmails = results.filter(result => result && result.error).map(result => result.email);
      const successCount = entries.length - failedEmails.length;

      res.json({ 
        message: `Launch announcement emails sent to ${successCount} of ${entries.length} subscribers`,
        failedEmails: failedEmails.length > 0 ? failedEmails : undefined
      });
    } catch (error) {
      console.error("Error sending launch announcement emails:", error);
      res.status(500).json({ message: "Failed to send launch announcement emails" });
    }
  });

  // In Vercel serverless environment, return null instead of HTTP server
  if (process.env.VERCEL) {
    return null;
  }
  
  // Create HTTP server for traditional environments
  const httpServer = createServer(app);
  return httpServer;
}