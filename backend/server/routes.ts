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

  // Authentication routes
  
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

  // Waitlist routes
  
  // Add email to waitlist
  app.post("/api/waitlist", async (req, res) => {
    try {
      // Validate request body against schema
      const validatedData = emailSchema.parse(req.body);
      
      // Check if email already exists in waitlist
      const existingEntry = await storage.getWaitlistEntryByEmail(validatedData.email);
      
      if (existingEntry) {
        return res.status(409).json({ error: "Email already in waitlist" });
      }
      
      // Add to waitlist
      const waitlistEntry = await storage.addToWaitlist({ email: validatedData.email });
      
      // Send welcome email in the background
      emailService.sendWelcomeEmail(validatedData.email).catch(err => {
        console.error("Failed to send welcome email:", err);
      });
      
      return res.status(201).json({ success: true, data: waitlistEntry });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ error: validationError.message });
      }
      
      console.error("Error adding to waitlist:", error);
      return res.status(500).json({ error: "Failed to add to waitlist" });
    }
  });
  
  // List all waitlist entries (admin only)
  app.get("/api/waitlist", authenticateAdmin, async (req, res) => {
    try {
      const entries = await storage.getAllWaitlistEntries();
      return res.json({ data: entries });
    } catch (error) {
      console.error("Error fetching waitlist:", error);
      return res.status(500).json({ error: "Failed to fetch waitlist entries" });
    }
  });
  
  // Delete waitlist entry (admin only)
  app.delete("/api/waitlist/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
      }
      
      const success = await storage.deleteWaitlistEntry(id);
      
      if (!success) {
        return res.status(404).json({ error: "Entry not found" });
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting waitlist entry:", error);
      return res.status(500).json({ error: "Failed to delete waitlist entry" });
    }
  });
  
  // Email routes (admin only)
  
  // Send promotional email to all waitlist subscribers
  app.post("/api/email/promotional", authenticateAdmin, async (req, res) => {
    try {
      const { message } = req.body;
      
      // Get all waitlist entries
      const entries = await storage.getAllWaitlistEntries();
      
      if (entries.length === 0) {
        return res.status(404).json({ error: "No waitlist subscribers found" });
      }
      
      // Send emails in the background
      const emailPromises = entries.map(entry => 
        emailService.sendPromotionalEmail(entry.email, message)
      );
      
      Promise.all(emailPromises).catch(err => {
        console.error("Error sending some promotional emails:", err);
      });
      
      return res.json({
        success: true,
        message: `Sending promotional emails to ${entries.length} subscribers`
      });
    } catch (error) {
      console.error("Error sending promotional emails:", error);
      return res.status(500).json({ error: "Failed to send promotional emails" });
    }
  });
  
  // Send launch announcement to all waitlist subscribers
  app.post("/api/email/launch", authenticateAdmin, async (req, res) => {
    try {
      // Get all waitlist entries
      const entries = await storage.getAllWaitlistEntries();
      
      if (entries.length === 0) {
        return res.status(404).json({ error: "No waitlist subscribers found" });
      }
      
      // Send emails in the background
      const emailPromises = entries.map(entry => 
        emailService.sendLaunchEmail(entry.email)
      );
      
      Promise.all(emailPromises).catch(err => {
        console.error("Error sending some launch emails:", err);
      });
      
      return res.json({
        success: true,
        message: `Sending launch announcement to ${entries.length} subscribers`
      });
    } catch (error) {
      console.error("Error sending launch announcements:", error);
      return res.status(500).json({ error: "Failed to send launch announcements" });
    }
  });

  // No WebSocket server needed for this application
  return null;
}