import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (for admin users)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull() // In a real app, use password hashing
});

// Schema for creating users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});

// Waitlist entries
export const waitlistEntries = pgTable("waitlist_entries", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Schema for creating waitlist entries
export const insertWaitlistSchema = createInsertSchema(waitlistEntries).pick({
  email: true
});

// Email form schema - for frontend validation
export const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;