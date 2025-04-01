import { db } from './db';
import { eq } from 'drizzle-orm';
import { users, waitlistEntries } from '@shared/schema';
import type { User, InsertUser, WaitlistEntry, InsertWaitlist } from '@shared/schema';

/**
 * Interface for storage operations
 */
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Waitlist operations
  getAllWaitlistEntries(): Promise<WaitlistEntry[]>;
  getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined>;
  addToWaitlist(entry: InsertWaitlist): Promise<WaitlistEntry>;
  deleteWaitlistEntry(id: number): Promise<boolean>;
}

/**
 * Database storage implementation
 */
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return results[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return results[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const results = await db.insert(users).values(insertUser).returning();
    return results[0];
  }

  async getAllWaitlistEntries(): Promise<WaitlistEntry[]> {
    return await db.select().from(waitlistEntries).orderBy(waitlistEntries.createdAt);
  }

  async getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined> {
    const results = await db.select().from(waitlistEntries).where(eq(waitlistEntries.email, email)).limit(1);
    return results[0];
  }

  async addToWaitlist(entry: InsertWaitlist): Promise<WaitlistEntry> {
    const results = await db.insert(waitlistEntries).values(entry).returning();
    return results[0];
  }

  async deleteWaitlistEntry(id: number): Promise<boolean> {
    const results = await db.delete(waitlistEntries).where(eq(waitlistEntries.id, id)).returning();
    return results.length > 0;
  }
}

/**
 * In-memory storage implementation (for development/testing)
 */
class MemStorage implements IStorage {
  private users: Map<number, User>;
  private waitlist: Map<number, WaitlistEntry>;
  private currentUserId: number;
  private currentWaitlistId: number;

  constructor() {
    this.users = new Map();
    this.waitlist = new Map();
    this.currentUserId = 1;
    this.currentWaitlistId = 1;

    // Add a default admin user
    this.createUser({
      username: 'admin',
      password: 'password', // In production, this would be hashed
      isAdmin: true
    }).catch(console.error);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt, 
      isAdmin: insertUser.isAdmin || false 
    };
    
    this.users.set(id, user);
    return user;
  }

  async getAllWaitlistEntries(): Promise<WaitlistEntry[]> {
    return Array.from(this.waitlist.values());
  }

  async getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined> {
    for (const entry of this.waitlist.values()) {
      if (entry.email === email) {
        return entry;
      }
    }
    return undefined;
  }

  async addToWaitlist(entry: InsertWaitlist): Promise<WaitlistEntry> {
    const id = this.currentWaitlistId++;
    const createdAt = new Date();
    
    const waitlistEntry: WaitlistEntry = { 
      ...entry, 
      id, 
      createdAt,
      name: entry.name || null,
      referralSource: entry.referralSource || null,
      hasReceivedWelcomeEmail: false,
      subscriberCount: 0
    };
    
    this.waitlist.set(id, waitlistEntry);
    return waitlistEntry;
  }

  async deleteWaitlistEntry(id: number): Promise<boolean> {
    return this.waitlist.delete(id);
  }
}

// Choose the appropriate storage implementation based on the environment
export const storage = process.env.DATABASE_URL 
  ? new DatabaseStorage() 
  : new MemStorage();