import {
  tasks,
  users,
  type Task,
  type InsertTask,
  type UpdateTask,
  type User,
  type UpsertUser,
  type LoginData,
  type RegisterData,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Local auth operations
  getUserByEmail(email: string): Promise<User | undefined>;
  createLocalUser(userData: RegisterData): Promise<User>;
  verifyPassword(email: string, password: string): Promise<User | null>;
  
  // Task operations
  getTasks(userId: string): Promise<Task[]>;
  getTask(id: number, userId: string): Promise<Task | undefined>;
  createTask(task: InsertTask, userId: string): Promise<Task>;
  updateTask(id: number, task: UpdateTask, userId: string): Promise<Task | undefined>;
  deleteTask(id: number, userId: string): Promise<boolean>;
  getActiveTasks(userId: string): Promise<Task[]>;
  getCompletedTasks(userId: string): Promise<Task[]>;
  getTimerTasks(userId: string): Promise<Task[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Local auth operations
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createLocalUser(userData: RegisterData): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const userId = nanoid();
    
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: hashedPassword,
        authProvider: "local",
      })
      .returning();
    return user;
  }

  async verifyPassword(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user || !user.password || user.authProvider !== "local") {
      return null;
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  // Task operations
  async getTasks(userId: string): Promise<Task[]> {
    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.userId, userId))
      .orderBy(tasks.createdAt);
    return result.reverse();
  }

  async getTask(id: number, userId: string): Promise<Task | undefined> {
    const [task] = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask, userId: string): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        ...insertTask,
        userId,
        createdAt: Date.now(),
      })
      .returning();
    return task;
  }

  async updateTask(id: number, updateTask: UpdateTask, userId: string): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updateTask)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number, userId: string): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(and(eq(tasks.id, id), eq(tasks.userId, userId)));
    return (result.rowCount || 0) > 0;
  }

  async getActiveTasks(userId: string): Promise<Task[]> {
    const result = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId)))
      .orderBy(tasks.createdAt);
    return result.filter(task => !task.completedAt).reverse();
  }

  async getCompletedTasks(userId: string): Promise<Task[]> {
    const result = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId)))
      .orderBy(tasks.completedAt);
    return result.filter(task => task.completedAt).reverse();
  }

  async getTimerTasks(userId: string): Promise<Task[]> {
    const result = await db
      .select()
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.completed, true)))
      .orderBy(tasks.checkedAt);
    return result.filter(task => task.checkedAt && !task.completedAt);
  }
}

export const storage = new DatabaseStorage();
