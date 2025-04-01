import { 
  users, 
  waitlistEntries, 
  rewards, 
  tasks, 
  PREDEFINED_TASKS, 
  LEVEL_THRESHOLDS,
  type User, 
  type InsertUser, 
  type WaitlistEntry, 
  type InsertWaitlist,
  type Reward,
  type Task
} from "@shared/schema";
import { db } from "./db";
import { eq, sql, and } from "drizzle-orm";
import crypto from 'crypto';

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Waitlist operations
  getAllWaitlistEntries(): Promise<WaitlistEntry[]>;
  getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined>;
  addToWaitlist(entry: InsertWaitlist): Promise<WaitlistEntry>;
  deleteWaitlistEntry(id: number): Promise<boolean>;
  
  // Gamification operations
  getWaitlistEntryByReferralCode(referralCode: string): Promise<WaitlistEntry | undefined>;
  updateWaitlistEntry(id: number, updates: Partial<WaitlistEntry>): Promise<WaitlistEntry>;
  generateReferralCode(email: string): Promise<string>;
  addPoints(email: string, points: number): Promise<WaitlistEntry>;
  completeTask(email: string, taskId: number): Promise<WaitlistEntry>;
  checkLevelUp(email: string): Promise<{ leveledUp: boolean; newLevel?: number; unlockedRewards?: string[] }>;
  
  // Rewards and tasks operations
  getAllRewards(): Promise<Reward[]>;
  getActiveRewards(): Promise<Reward[]>;
  getRewardsByLevel(level: number): Promise<Reward[]>;
  getAllTasks(): Promise<Task[]>;
  getActiveTasks(): Promise<Task[]>;
  
  // Initialization
  initializeGamificationSystem(): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getAllWaitlistEntries(): Promise<WaitlistEntry[]> {
    return await db.select().from(waitlistEntries).orderBy(waitlistEntries.createdAt);
  }

  async getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined> {
    const [entry] = await db.select().from(waitlistEntries).where(eq(waitlistEntries.email, email));
    return entry || undefined;
  }

  async addToWaitlist(entry: InsertWaitlist): Promise<WaitlistEntry> {
    // Generate a referral code if not provided
    const referralCode = entry.referredBy 
      ? await this.generateReferralCode(entry.email)
      : null;
    
    const insertData = {
      ...entry,
      referralCode,
      // Initialize gamification fields
      level: 1,
      points: 0,
      taskCompletions: {},
      unlockedRewards: [],
      lastInteractionAt: new Date()
    };
    
    const [waitlistEntry] = await db
      .insert(waitlistEntries)
      .values(insertData)
      .returning();
    
    // If this user was referred by someone, update the referrer's points
    if (entry.referredBy) {
      const referrerEntry = await this.getWaitlistEntryByReferralCode(entry.referredBy);
      if (referrerEntry) {
        await this.completeTask(referrerEntry.email, 2); // Referral task ID
      }
    }
    
    // Complete the signup task automatically
    await this.completeTask(waitlistEntry.email, 1); // Signup task ID
    
    return waitlistEntry;
  }

  async deleteWaitlistEntry(id: number): Promise<boolean> {
    const [deleted] = await db
      .delete(waitlistEntries)
      .where(eq(waitlistEntries.id, id))
      .returning();
    return !!deleted;
  }
  
  // --- Gamification Methods ---
  
  async getWaitlistEntryByReferralCode(referralCode: string): Promise<WaitlistEntry | undefined> {
    const [entry] = await db.select().from(waitlistEntries).where(eq(waitlistEntries.referralCode, referralCode));
    return entry || undefined;
  }
  
  async updateWaitlistEntry(id: number, updates: Partial<WaitlistEntry>): Promise<WaitlistEntry> {
    const [updated] = await db
      .update(waitlistEntries)
      .set({
        ...updates,
        lastInteractionAt: new Date()
      })
      .where(eq(waitlistEntries.id, id))
      .returning();
    return updated;
  }
  
  async generateReferralCode(email: string): Promise<string> {
    // Create a deterministic but random-looking referral code based on email
    const hash = crypto.createHash('sha256').update(email + Date.now().toString()).digest('hex');
    const code = hash.substring(0, 8).toUpperCase();
    return code;
  }
  
  async addPoints(email: string, points: number): Promise<WaitlistEntry> {
    const entry = await this.getWaitlistEntryByEmail(email);
    if (!entry) {
      throw new Error('User not found');
    }
    
    const newPoints = (entry.points || 0) + points;
    
    const [updated] = await db
      .update(waitlistEntries)
      .set({
        points: newPoints,
        lastInteractionAt: new Date()
      })
      .where(eq(waitlistEntries.id, entry.id))
      .returning();
    
    // Check if the user should level up
    await this.checkLevelUp(email);
    
    return updated;
  }
  
  async completeTask(email: string, taskId: number): Promise<WaitlistEntry> {
    const entry = await this.getWaitlistEntryByEmail(email);
    if (!entry) {
      throw new Error('User not found');
    }
    
    // Find the task
    const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId));
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Check if task was already completed
    const taskCompletions = entry.taskCompletions || {};
    if (taskCompletions[taskId.toString()]) {
      return entry; // Task already completed, no points awarded
    }
    
    // Update task completions
    taskCompletions[taskId.toString()] = true;
    
    // Award points
    const newPoints = (entry.points || 0) + task.pointsAwarded;
    
    const [updated] = await db
      .update(waitlistEntries)
      .set({
        points: newPoints,
        taskCompletions,
        lastInteractionAt: new Date()
      })
      .where(eq(waitlistEntries.id, entry.id))
      .returning();
    
    // Check if the user should level up
    await this.checkLevelUp(email);
    
    return updated;
  }
  
  async checkLevelUp(email: string): Promise<{ leveledUp: boolean; newLevel?: number; unlockedRewards?: string[] }> {
    const entry = await this.getWaitlistEntryByEmail(email);
    if (!entry) {
      throw new Error('User not found');
    }
    
    const currentLevel = entry.level || 1;
    const currentPoints = entry.points || 0;
    
    // Find the appropriate level for the current points
    let newLevel = currentLevel;
    let unlockedRewards: string[] = [];
    
    for (const levelData of LEVEL_THRESHOLDS) {
      if (currentPoints >= levelData.requiredPoints && levelData.level > newLevel) {
        newLevel = levelData.level;
        if (levelData.rewards) {
          unlockedRewards = [...unlockedRewards, ...(levelData.rewards || [])];
        }
      }
    }
    
    // If the level hasn't changed, return immediately
    if (newLevel === currentLevel) {
      return { leveledUp: false };
    }
    
    // Get the user's current unlocked rewards
    const currentUnlockedRewards = entry.unlockedRewards || [];
    
    // Filter out rewards the user already has
    const newUnlockedRewards = unlockedRewards.filter(
      reward => !currentUnlockedRewards.includes(reward)
    );
    
    // Update the user's level and unlocked rewards
    const [updated] = await db
      .update(waitlistEntries)
      .set({
        level: newLevel,
        unlockedRewards: [...currentUnlockedRewards, ...newUnlockedRewards],
        lastInteractionAt: new Date()
      })
      .where(eq(waitlistEntries.id, entry.id))
      .returning();
    
    return {
      leveledUp: true,
      newLevel,
      unlockedRewards: newUnlockedRewards
    };
  }
  
  // --- Rewards and Tasks Methods ---
  
  async getAllRewards(): Promise<Reward[]> {
    return await db.select().from(rewards).orderBy(rewards.requiredLevel);
  }
  
  async getActiveRewards(): Promise<Reward[]> {
    return await db.select().from(rewards).where(eq(rewards.isActive, true)).orderBy(rewards.requiredLevel);
  }
  
  async getRewardsByLevel(level: number): Promise<Reward[]> {
    return await db.select().from(rewards)
      .where(and(
        eq(rewards.isActive, true),
        sql`${rewards.requiredLevel} <= ${level}`
      ))
      .orderBy(rewards.requiredLevel);
  }
  
  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(tasks.pointsAwarded);
  }
  
  async getActiveTasks(): Promise<Task[]> {
    return await db.select().from(tasks).where(eq(tasks.isActive, true)).orderBy(tasks.pointsAwarded);
  }
  
  // --- Initialization ---
  
  async initializeGamificationSystem(): Promise<boolean> {
    // Check if tasks already exist
    const existingTasks = await this.getAllTasks();
    if (existingTasks.length === 0) {
      // Insert predefined tasks
      for (const taskData of PREDEFINED_TASKS) {
        await db.insert(tasks).values({
          name: taskData.name,
          description: taskData.description,
          pointsAwarded: taskData.pointsAwarded,
          type: taskData.type,
          isActive: true
        });
      }
    }
    
    // Check if rewards already exist
    const existingRewards = await this.getAllRewards();
    if (existingRewards.length === 0) {
      // Insert predefined rewards based on level thresholds
      const rewardDefinitions = [
        {
          name: 'Exclusive Preview',
          description: 'Early access to collection preview images',
          requiredLevel: 2,
          requiredPoints: 100,
          type: 'exclusive_content',
          value: 'preview_access',
        },
        {
          name: '5% Discount',
          description: '5% discount on your first purchase',
          requiredLevel: 3,
          requiredPoints: 250,
          type: 'discount',
          value: 'KLEDE5',
        },
        {
          name: '10% Discount',
          description: '10% discount on your first purchase',
          requiredLevel: 4,
          requiredPoints: 500,
          type: 'discount',
          value: 'KLEDE10',
        },
        {
          name: 'Early Access',
          description: 'Shop the collection before public release',
          requiredLevel: 5,
          requiredPoints: 1000,
          type: 'early_access',
          value: 'early_access',
        },
      ];
      
      for (const rewardData of rewardDefinitions) {
        await db.insert(rewards).values({
          name: rewardData.name,
          description: rewardData.description,
          requiredLevel: rewardData.requiredLevel,
          requiredPoints: rewardData.requiredPoints,
          type: rewardData.type,
          value: rewardData.value,
          isActive: true
        });
      }
    }
    
    return true;
  }
}

// Fallback to in-memory storage if DATABASE_URL is not set
class MemStorage implements IStorage {
  private users: Map<number, User>;
  private waitlist: Map<number, WaitlistEntry>;
  private rewardsMap: Map<number, Reward>;
  private tasksMap: Map<number, Task>;
  private currentUserId: number;
  private currentWaitlistId: number;
  private currentRewardId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.waitlist = new Map();
    this.rewardsMap = new Map();
    this.tasksMap = new Map();
    this.currentUserId = 1;
    this.currentWaitlistId = 1;
    this.currentRewardId = 1;
    this.currentTaskId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      isAdmin: insertUser.isAdmin || false
    };
    this.users.set(id, user);
    return user;
  }

  async getAllWaitlistEntries(): Promise<WaitlistEntry[]> {
    return Array.from(this.waitlist.values()).sort((a, b) => 
      a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  async getWaitlistEntryByEmail(email: string): Promise<WaitlistEntry | undefined> {
    return Array.from(this.waitlist.values()).find(
      (entry) => entry.email === email,
    );
  }

  async addToWaitlist(entry: InsertWaitlist): Promise<WaitlistEntry> {
    // Generate a referral code
    const referralCode = await this.generateReferralCode(entry.email);
    
    const id = this.currentWaitlistId++;
    const waitlistEntry: WaitlistEntry = { 
      ...entry, 
      id, 
      createdAt: new Date(),
      hasReceivedWelcomeEmail: false,
      subscriberCount: 0,
      level: 1,
      points: 0,
      referralCode,
      taskCompletions: {},
      unlockedRewards: [],
      lastInteractionAt: new Date()
    };
    
    this.waitlist.set(id, waitlistEntry);
    
    // If this user was referred by someone, update the referrer's points
    if (entry.referredBy) {
      const referrerEntry = await this.getWaitlistEntryByReferralCode(entry.referredBy);
      if (referrerEntry) {
        await this.completeTask(referrerEntry.email, 2); // Referral task ID
      }
    }
    
    // Complete the signup task automatically
    await this.completeTask(waitlistEntry.email, 1); // Signup task ID
    
    return waitlistEntry;
  }

  async deleteWaitlistEntry(id: number): Promise<boolean> {
    return this.waitlist.delete(id);
  }
  
  // --- Gamification Methods ---
  
  async getWaitlistEntryByReferralCode(referralCode: string): Promise<WaitlistEntry | undefined> {
    return Array.from(this.waitlist.values()).find(
      entry => entry.referralCode === referralCode
    );
  }
  
  async updateWaitlistEntry(id: number, updates: Partial<WaitlistEntry>): Promise<WaitlistEntry> {
    const entry = this.waitlist.get(id);
    if (!entry) throw new Error('Waitlist entry not found');
    
    const updatedEntry: WaitlistEntry = {
      ...entry,
      ...updates,
      lastInteractionAt: new Date()
    };
    
    this.waitlist.set(id, updatedEntry);
    return updatedEntry;
  }
  
  async generateReferralCode(email: string): Promise<string> {
    // Create a deterministic but random-looking referral code based on email
    const hash = crypto.createHash('sha256').update(email + Date.now().toString()).digest('hex');
    const code = hash.substring(0, 8).toUpperCase();
    return code;
  }
  
  async addPoints(email: string, points: number): Promise<WaitlistEntry> {
    const entry = await this.getWaitlistEntryByEmail(email);
    if (!entry) throw new Error('User not found');
    
    const newPoints = (entry.points || 0) + points;
    
    const updatedEntry = {
      ...entry,
      points: newPoints,
      lastInteractionAt: new Date()
    };
    
    this.waitlist.set(entry.id, updatedEntry);
    
    // Check if the user should level up
    await this.checkLevelUp(email);
    
    return updatedEntry;
  }
  
  async completeTask(email: string, taskId: number): Promise<WaitlistEntry> {
    const entry = await this.getWaitlistEntryByEmail(email);
    if (!entry) throw new Error('User not found');
    
    // Find the task
    const task = this.tasksMap.get(taskId);
    if (!task) {
      // If task doesn't exist yet (only in memory storage scenario), create it using predefined tasks
      if (taskId > 0 && taskId <= PREDEFINED_TASKS.length) {
        const taskData = PREDEFINED_TASKS[taskId - 1];
        const newTask: Task = {
          id: taskId,
          name: taskData.name,
          description: taskData.description,
          pointsAwarded: taskData.pointsAwarded,
          type: taskData.type,
          requirements: null,
          isActive: true,
          createdAt: new Date()
        };
        this.tasksMap.set(taskId, newTask);
      } else {
        throw new Error('Task not found');
      }
    }
    
    // Check if task was already completed
    const taskCompletions = entry.taskCompletions || {};
    if (taskCompletions[taskId.toString()]) {
      return entry; // Task already completed, no points awarded
    }
    
    // Update task completions
    taskCompletions[taskId.toString()] = true;
    
    // Award points
    const taskPoints = task?.pointsAwarded || 
      (taskId > 0 && taskId <= PREDEFINED_TASKS.length ? PREDEFINED_TASKS[taskId - 1].pointsAwarded : 50);
    
    const newPoints = (entry.points || 0) + taskPoints;
    
    const updatedEntry = {
      ...entry,
      points: newPoints,
      taskCompletions,
      lastInteractionAt: new Date()
    };
    
    this.waitlist.set(entry.id, updatedEntry);
    
    // Check if the user should level up
    await this.checkLevelUp(email);
    
    return updatedEntry;
  }
  
  async checkLevelUp(email: string): Promise<{ leveledUp: boolean; newLevel?: number; unlockedRewards?: string[] }> {
    const entry = await this.getWaitlistEntryByEmail(email);
    if (!entry) throw new Error('User not found');
    
    const currentLevel = entry.level || 1;
    const currentPoints = entry.points || 0;
    
    // Find the appropriate level for the current points
    let newLevel = currentLevel;
    let unlockedRewards: string[] = [];
    
    for (const levelData of LEVEL_THRESHOLDS) {
      if (currentPoints >= levelData.requiredPoints && levelData.level > newLevel) {
        newLevel = levelData.level;
        if (levelData.rewards) {
          unlockedRewards = [...unlockedRewards, ...(levelData.rewards || [])];
        }
      }
    }
    
    // If the level hasn't changed, return immediately
    if (newLevel === currentLevel) {
      return { leveledUp: false };
    }
    
    // Get the user's current unlocked rewards
    const currentUnlockedRewards = entry.unlockedRewards || [];
    
    // Filter out rewards the user already has
    const newUnlockedRewards = unlockedRewards.filter(
      reward => !currentUnlockedRewards.includes(reward)
    );
    
    // Update the user's level and unlocked rewards
    const updatedEntry = {
      ...entry,
      level: newLevel,
      unlockedRewards: [...currentUnlockedRewards, ...newUnlockedRewards],
      lastInteractionAt: new Date()
    };
    
    this.waitlist.set(entry.id, updatedEntry);
    
    return {
      leveledUp: true,
      newLevel,
      unlockedRewards: newUnlockedRewards
    };
  }
  
  // --- Rewards and Tasks Methods ---
  
  async getAllRewards(): Promise<Reward[]> {
    return Array.from(this.rewardsMap.values()).sort((a, b) => a.requiredLevel - b.requiredLevel);
  }
  
  async getActiveRewards(): Promise<Reward[]> {
    return Array.from(this.rewardsMap.values())
      .filter(reward => reward.isActive)
      .sort((a, b) => a.requiredLevel - b.requiredLevel);
  }
  
  async getRewardsByLevel(level: number): Promise<Reward[]> {
    return Array.from(this.rewardsMap.values())
      .filter(reward => reward.isActive && reward.requiredLevel <= level)
      .sort((a, b) => a.requiredLevel - b.requiredLevel);
  }
  
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasksMap.values()).sort((a, b) => a.pointsAwarded - b.pointsAwarded);
  }
  
  async getActiveTasks(): Promise<Task[]> {
    return Array.from(this.tasksMap.values())
      .filter(task => task.isActive)
      .sort((a, b) => a.pointsAwarded - b.pointsAwarded);
  }
  
  // --- Initialization ---
  
  async initializeGamificationSystem(): Promise<boolean> {
    // Check if tasks already exist
    if (this.tasksMap.size === 0) {
      // Insert predefined tasks
      for (let i = 0; i < PREDEFINED_TASKS.length; i++) {
        const taskData = PREDEFINED_TASKS[i];
        const id = i + 1;
        const task: Task = {
          id,
          name: taskData.name,
          description: taskData.description,
          pointsAwarded: taskData.pointsAwarded,
          type: taskData.type,
          requirements: null,
          isActive: true,
          createdAt: new Date()
        };
        this.tasksMap.set(id, task);
      }
    }
    
    // Check if rewards already exist
    if (this.rewardsMap.size === 0) {
      // Insert predefined rewards based on level thresholds
      const rewardDefinitions = [
        {
          name: 'Exclusive Preview',
          description: 'Early access to collection preview images',
          requiredLevel: 2,
          requiredPoints: 100,
          type: 'exclusive_content',
          value: 'preview_access',
        },
        {
          name: '5% Discount',
          description: '5% discount on your first purchase',
          requiredLevel: 3,
          requiredPoints: 250,
          type: 'discount',
          value: 'KLEDE5',
        },
        {
          name: '10% Discount',
          description: '10% discount on your first purchase',
          requiredLevel: 4,
          requiredPoints: 500,
          type: 'discount',
          value: 'KLEDE10',
        },
        {
          name: 'Early Access',
          description: 'Shop the collection before public release',
          requiredLevel: 5,
          requiredPoints: 1000,
          type: 'early_access',
          value: 'early_access',
        },
      ];
      
      for (let i = 0; i < rewardDefinitions.length; i++) {
        const rewardData = rewardDefinitions[i];
        const id = i + 1;
        const reward: Reward = {
          id,
          name: rewardData.name,
          description: rewardData.description,
          requiredLevel: rewardData.requiredLevel,
          requiredPoints: rewardData.requiredPoints,
          type: rewardData.type,
          value: rewardData.value,
          isActive: true,
          createdAt: new Date()
        };
        this.rewardsMap.set(id, reward);
      }
    }
    
    return true;
  }
}

// Use DatabaseStorage if DATABASE_URL is set, otherwise use MemStorage
export const storage = process.env.DATABASE_URL
  ? new DatabaseStorage()
  : new MemStorage();
