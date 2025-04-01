import { db } from './db.js';
import { InsertUser, InsertWaitlist, User, WaitlistEntry, users, waitlistEntries } from "@shared/schema.js";
import { eq } from "drizzle-orm";

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
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async getAllWaitlistEntries(): Promise<WaitlistEntry[]> {
    return await db.select().from(waitlistEntries).orderBy(waitlistEntries.createdAt);
  }

  async getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined> {
    const result = await db.select().from(waitlistEntries).where(eq(waitlistEntries.email, email)).limit(1);
    return result[0];
  }

  async addToWaitlist(entry: InsertWaitlist): Promise<WaitlistEntry> {
    const result = await db.insert(waitlistEntries).values(entry).returning();
    return result[0];
  }

  async deleteWaitlistEntry(id: number): Promise<boolean> {
    const result = await db.delete(waitlistEntries).where(eq(waitlistEntries.id, id)).returning();
    return result.length > 0;
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

    // Add default admin user
    this.createUser({
      username: "admin",
      password: "admin123"
    }).catch(console.error);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllWaitlistEntries(): Promise<WaitlistEntry[]> {
    return Array.from(this.waitlist.values()).sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined> {
    return Array.from(this.waitlist.values()).find(entry => entry.email === email);
  }

  async addToWaitlist(entry: InsertWaitlist): Promise<WaitlistEntry> {
    const id = this.currentWaitlistId++;
    const waitlistEntry: WaitlistEntry = { 
      ...entry, 
      id, 
      createdAt: new Date() 
    };
    this.waitlist.set(id, waitlistEntry);
    return waitlistEntry;
  }

  async deleteWaitlistEntry(id: number): Promise<boolean> {
    if (!this.waitlist.has(id)) {
      return false;
    }
    return this.waitlist.delete(id);
  }
}

// Choose storage implementation based on environment
export const storage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();