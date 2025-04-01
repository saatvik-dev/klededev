import { pgTable, text, timestamp, serial, boolean, integer, jsonb } from 'drizzle-orm/pg-core';
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
  isAdmin: boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
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
  hasReceivedWelcomeEmail: boolean('has_received_welcome_email').default(false).notNull(),
  subscriberCount: integer('subscriber_count').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  
  // Gamification fields
  level: integer('level').default(1).notNull(),
  points: integer('points').default(0).notNull(),
  referralCode: text('referral_code').unique(),
  referredBy: text('referred_by'),
  taskCompletions: jsonb('task_completions').$type<Record<string, boolean>>().default({}).notNull(),
  unlockedRewards: jsonb('unlocked_rewards').$type<string[]>().default([]).notNull(),
  lastInteractionAt: timestamp('last_interaction_at').defaultNow(),
});

/**
 * Rewards table schema
 * Stores available rewards for the gamified waitlist
 */
export const rewards = pgTable('rewards', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  requiredLevel: integer('required_level').notNull(),
  requiredPoints: integer('required_points').notNull(),
  type: text('type').notNull(), // 'discount', 'early_access', 'exclusive_content', etc.
  value: text('value'), // If it's a discount code, the actual code
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Tasks table schema
 * Stores tasks that users can complete to earn points
 */
export const tasks = pgTable('tasks', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  pointsAwarded: integer('points_awarded').notNull(),
  type: text('type').notNull(), // 'referral', 'social_share', 'email_opened', 'survey', etc.
  requirements: jsonb('requirements').$type<Record<string, any>>(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Schema for inserting a new waitlist entry
 */
export const insertWaitlistSchema = createInsertSchema(waitlistEntries).pick({
  email: true,
  name: true,
  referralSource: true,
  referredBy: true,
});

/**
 * Schema for email validation
 * Used for the frontend form
 */
export const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  referralCode: z.string().optional(),
});

/**
 * Schema for completing a task
 */
export const completeTaskSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  taskId: z.number(),
  proofOfCompletion: z.any().optional(),
});

/**
 * Schema for level system
 */
export const levelSystemSchema = z.array(
  z.object({
    level: z.number(),
    requiredPoints: z.number(),
    rewards: z.array(z.string()).optional(),
  })
);

/**
 * Type definitions for the user and waitlist entry objects
 */
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWaitlist = z.infer<typeof insertWaitlistSchema>;
export type WaitlistEntry = typeof waitlistEntries.$inferSelect;

export type Reward = typeof rewards.$inferSelect;
export type Task = typeof tasks.$inferSelect;

export type LevelSystem = z.infer<typeof levelSystemSchema>;

// Define level thresholds and rewards
export const LEVEL_THRESHOLDS: LevelSystem = [
  { level: 1, requiredPoints: 0 },
  { level: 2, requiredPoints: 100, rewards: ['exclusive_preview'] },
  { level: 3, requiredPoints: 250, rewards: ['5_percent_discount'] },
  { level: 4, requiredPoints: 500, rewards: ['10_percent_discount'] },
  { level: 5, requiredPoints: 1000, rewards: ['early_access'] },
];

// Define predefined tasks
export const PREDEFINED_TASKS = [
  {
    name: 'Join Waitlist',
    description: 'Sign up for our exclusive collection waitlist',
    pointsAwarded: 50,
    type: 'signup',
  },
  {
    name: 'Refer a Friend',
    description: 'Invite a friend to join the waitlist',
    pointsAwarded: 100,
    type: 'referral',
  },
  {
    name: 'Share on Social Media',
    description: 'Share our collection on your social media',
    pointsAwarded: 75,
    type: 'social_share',
  },
  {
    name: 'Complete Style Survey',
    description: 'Tell us about your fashion preferences',
    pointsAwarded: 50,
    type: 'survey',
  },
  {
    name: 'Open Welcome Email',
    description: 'Open and read your welcome email',
    pointsAwarded: 25,
    type: 'email_opened',
  },
];