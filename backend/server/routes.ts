import { Express, Request, Response } from 'express';
import passport from 'passport';
import { createServer as createHttpServer, Server as HttpServer } from 'http';
import { emailSchema, insertWaitlistSchema } from '@shared/schema';
import { storage } from './storage';
import { emailService } from './emails/emailService';

// Add session data type
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
  }
}

/**
 * Middleware to authenticate admin users
 */
const authenticateAdmin = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user && (req.user as any).isAdmin) {
    return next();
  }
  res.status(401).json({ message: 'Unauthorized' });
};

/**
 * Register all API routes
 * @param app Express application
 * @returns HTTP server instance if WebSocket is configured, otherwise null
 */
export async function registerRoutes(app: Express): Promise<HttpServer | null> {
  let httpServer: HttpServer | null = null;

  // Create HTTP server for potential WebSocket support
  httpServer = createHttpServer(app);

  // Authentication routes
  app.post('/api/login', (req, res, next) => {
    passport.authenticate("local", (err: Error, user: any, info: any) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.status(401).json({ message: info.message || 'Authentication failed' });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        req.session.isAdmin = user.isAdmin;
        return res.json({ message: 'Authentication successful', user: { id: user.id, username: user.username, isAdmin: user.isAdmin } });
      });
    })(req, res, next);
  });

  app.post('/api/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: 'Error logging out' });
      }
      res.json({ message: 'Logout successful' });
    });
  });

  // Waitlist routes
  app.post('/api/waitlist', async (req, res) => {
    try {
      // Validate request body
      const parsedData = emailSchema.safeParse(req.body);
      
      if (!parsedData.success) {
        return res.status(400).json({ 
          message: 'Invalid request data',
          errors: parsedData.error.format() 
        });
      }
      
      const { email } = parsedData.data;
      
      // Check if email already exists
      const existingEntry = await storage.getWaitlistEntryByEmail(email);
      
      if (existingEntry) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      
      // Create waitlist entry with validated data
      const waitlistData = insertWaitlistSchema.parse({
        email,
        name: req.body.name || null,
        referralSource: req.body.referralSource || null,
        hasReceivedWelcomeEmail: false,
        subscriberCount: 0
      });
      
      const newEntry = await storage.addToWaitlist(waitlistData);
      
      // Send welcome email asynchronously
      emailService.sendWelcomeEmail(email).catch(err => {
        console.error('Failed to send welcome email:', err);
      });
      
      // Return success response
      res.status(201).json({
        message: 'Successfully added to waitlist',
        entry: {
          id: newEntry.id,
          email: newEntry.email,
          createdAt: newEntry.createdAt
        }
      });
    } catch (error) {
      console.error('Error adding to waitlist:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Admin routes (protected)
  app.get('/api/admin/waitlist', authenticateAdmin, async (req, res) => {
    try {
      const entries = await storage.getAllWaitlistEntries();
      res.json(entries);
    } catch (error) {
      console.error('Error fetching waitlist entries:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.delete('/api/admin/waitlist/:id', authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      
      if (isNaN(id)) {
        return res.status(400).json({ message: 'Invalid ID format' });
      }
      
      const success = await storage.deleteWaitlistEntry(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Entry not found' });
      }
      
      res.json({ message: 'Entry deleted successfully' });
    } catch (error) {
      console.error('Error deleting waitlist entry:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Email management routes (protected)
  app.post('/api/admin/send-promotional', authenticateAdmin, async (req, res) => {
    try {
      const { email, message } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      await emailService.sendPromotionalEmail(email, message);
      res.json({ message: 'Promotional email sent successfully' });
    } catch (error) {
      console.error('Error sending promotional email:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.post('/api/admin/send-launch', authenticateAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: 'Email is required' });
      }
      
      await emailService.sendLaunchEmail(email);
      res.json({ message: 'Launch email sent successfully' });
    } catch (error) {
      console.error('Error sending launch email:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Return the HTTP server instance
  return httpServer;
}