import { pgTable, serial, text, timestamp, boolean, integer } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Users table schema
 * Stores admin users for the application
 */
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
});

/**
 * Schema for inserting a new user
 */
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

/**
 * Waitlist entries table schema
 * Stores waitlist signup information
 */
export const waitlistEntries = pgTable('waitlist_entries', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  name: text('name'),
  referralSource: text('referral_source'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  hasReceivedWelcomeEmail: boolean('has_received_welcome_email').default(false).notNull(),
  subscriberCount: integer('subscriber_count').default(0).notNull(),
});

/**
 * Schema for inserting a new waitlist entry
 */
export const insertWaitlistSchema = createInsertSchema(waitlistEntries).pick({
  email: true,
  name: true,
  referralSource: true,
  hasReceivedWelcomeEmail: true,
  subscriberCount: true,
});

/**
 * Schema for email validation
 * Used for the frontend form
 */
export const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

/**
 * Type definitions for the user and waitlist entry objects
 */
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;