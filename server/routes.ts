import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  emailSchema, 
  insertWaitlistSchema,
  completeTaskSchema,
  LEVEL_THRESHOLDS,
  PREDEFINED_TASKS
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import session from "express-session";
import MemoryStore from "memorystore";
import { emailService } from "./emails/emailService";

// Extend express-session with our custom properties
declare module 'express-session' {
  interface SessionData {
    isAdmin?: boolean;
  }
}

const SessionStore = MemoryStore(session);

// Basic admin authentication middleware
const authenticateAdmin = (req: Request, res: Response, next: Function) => {
  if (req.session.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export async function registerRoutes(app: Express): Promise<Server | null> {
  // Initialize gamification system
  await storage.initializeGamificationSystem();
  
  // Configure session
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "klede-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
    })
  );

  // API routes
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
      
      // Check referral code if provided
      let referredBy = null;
      if (validatedData.referralCode) {
        const referrer = await storage.getWaitlistEntryByReferralCode(validatedData.referralCode);
        if (referrer) {
          referredBy = validatedData.referralCode;
        }
      }
      
      // Add to waitlist
      const entry = await storage.addToWaitlist({
        email: validatedData.email,
        name: req.body.name,
        referralSource: req.body.referralSource,
        referredBy
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

  // Admin login route - simple authentication for demo purposes
  app.post("/api/admin/login", (req, res) => {
    const { username, password } = req.body;
    
    // In a real app, this would validate against database credentials
    // For now, using hardcoded admin/admin for simplicity
    if (username === "admin" && password === "admin") {
      req.session.isAdmin = true;
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  });

  // Admin logout
  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true });
    });
  });

  // Get all waitlist entries (admin only)
  app.get("/api/admin/waitlist", authenticateAdmin, async (_req, res) => {
    try {
      const entries = await storage.getAllWaitlistEntries();
      res.json(entries);
    } catch (error) {
      console.error("Error retrieving waitlist entries:", error);
      res.status(500).json({ message: "Failed to retrieve waitlist entries" });
    }
  });

  // Delete a waitlist entry (admin only)
  app.delete("/api/admin/waitlist/:id", authenticateAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID format" });
      }
      
      const success = await storage.deleteWaitlistEntry(id);
      if (!success) {
        return res.status(404).json({ message: "Entry not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting waitlist entry:", error);
      res.status(500).json({ message: "Failed to delete waitlist entry" });
    }
  });

  // Check admin authentication status
  app.get("/api/admin/check", (req, res) => {
    res.json({ isAuthenticated: req.session.isAdmin === true });
  });

  // Send a promotional email to all waitlist subscribers (admin only)
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

  // ---------- GAMIFICATION ROUTES ----------
  
  // Get a user's waitlist profile with gamification data
  app.get("/api/waitlist/profile", async (req, res) => {
    try {
      const { email } = req.query;
      
      if (!email || typeof email !== 'string') {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const entry = await storage.getWaitlistEntryByEmail(email);
      if (!entry) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get rewards available for the user's level
      const rewards = await storage.getRewardsByLevel(entry.level || 1);
      
      // Get active tasks
      const tasks = await storage.getActiveTasks();
      
      // Calculate progress to next level
      const currentLevel = entry.level || 1;
      const currentPoints = entry.points || 0;
      let nextLevelPoints = 0;
      let levelProgress = 100; // Default to 100% if at max level
      
      const nextLevelThreshold = LEVEL_THRESHOLDS.find(lt => lt.level === currentLevel + 1);
      if (nextLevelThreshold) {
        nextLevelPoints = nextLevelThreshold.requiredPoints;
        const prevLevelPoints = LEVEL_THRESHOLDS.find(lt => lt.level === currentLevel)?.requiredPoints || 0;
        const pointsForCurrentLevel = currentPoints - prevLevelPoints;
        const pointsNeededForNextLevel = nextLevelPoints - prevLevelPoints;
        levelProgress = Math.min(Math.round((pointsForCurrentLevel / pointsNeededForNextLevel) * 100), 100);
      }
      
      // Format the response with gamification data
      const response = {
        ...entry,
        tasks: tasks.map(task => ({
          ...task,
          completed: entry.taskCompletions && entry.taskCompletions[task.id.toString()] === true
        })),
        rewards,
        gamification: {
          currentLevel,
          currentPoints,
          nextLevelPoints,
          levelProgress,
          unlockedRewards: entry.unlockedRewards || []
        }
      };
      
      res.json(response);
    } catch (error) {
      console.error("Error getting waitlist profile:", error);
      res.status(500).json({ message: "Failed to get waitlist profile" });
    }
  });
  
  // Get referral information 
  app.get("/api/waitlist/referral/:referralCode", async (req, res) => {
    try {
      const { referralCode } = req.params;
      
      const entry = await storage.getWaitlistEntryByReferralCode(referralCode);
      if (!entry) {
        return res.status(404).json({ message: "Invalid referral code" });
      }
      
      // Return limited information about the referrer
      res.json({
        referralCode,
        referrerName: entry.name,
        valid: true
      });
    } catch (error) {
      console.error("Error getting referral info:", error);
      res.status(500).json({ message: "Failed to get referral information" });
    }
  });
  
  // Complete a task
  app.post("/api/waitlist/complete-task", async (req, res) => {
    try {
      const validatedData = completeTaskSchema.parse(req.body);
      
      const entry = await storage.getWaitlistEntryByEmail(validatedData.email);
      if (!entry) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Try to complete the task
      const updatedEntry = await storage.completeTask(validatedData.email, validatedData.taskId);
      
      // Check if the task was already completed
      const wasCompleted = entry.taskCompletions && 
                         entry.taskCompletions[validatedData.taskId.toString()] === true;
      
      // Check if the user leveled up
      const levelUpResult = await storage.checkLevelUp(validatedData.email);
      
      res.json({
        success: true,
        alreadyCompleted: wasCompleted,
        updatedEntry,
        levelUp: levelUpResult.leveledUp,
        newLevel: levelUpResult.newLevel,
        unlockedRewards: levelUpResult.unlockedRewards
      });
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ message: validationError.message });
      } else {
        console.error("Error completing task:", error);
        res.status(500).json({ message: "Failed to complete task" });
      }
    }
  });
  
  // Get leaderboard
  app.get("/api/waitlist/leaderboard", async (req, res) => {
    try {
      const entries = await storage.getAllWaitlistEntries();
      
      // Sort entries by points (descending)
      const leaderboard = entries
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .slice(0, 10) // Top 10
        .map(entry => ({
          name: entry.name || 'Anonymous',
          email: entry.email.split('@')[0] + '@***', // Mask email for privacy
          level: entry.level || 1,
          points: entry.points || 0
        }));
      
      res.json(leaderboard);
    } catch (error) {
      console.error("Error getting leaderboard:", error);
      res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });
  
  // Get level system and rewards information
  app.get("/api/waitlist/levels", async (_req, res) => {
    try {
      const rewards = await storage.getAllRewards();
      
      // Construct level system response with rewards
      const levels = LEVEL_THRESHOLDS.map(level => {
        const levelRewards = rewards.filter(r => r.requiredLevel === level.level);
        return {
          ...level,
          rewardsDetails: levelRewards
        };
      });
      
      res.json(levels);
    } catch (error) {
      console.error("Error getting level system:", error);
      res.status(500).json({ message: "Failed to get level system" });
    }
  });
  
  // Get all tasks
  app.get("/api/waitlist/tasks", async (_req, res) => {
    try {
      const tasks = await storage.getActiveTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Error getting tasks:", error);
      res.status(500).json({ message: "Failed to get tasks" });
    }
  });
  
  // ---------- END GAMIFICATION ROUTES ----------

  // In Vercel serverless environment, return null instead of HTTP server
  if (process.env.VERCEL) {
    return null;
  }
  
  // Create HTTP server for traditional environments
  const httpServer = createServer(app);
  return httpServer;
}
