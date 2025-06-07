import { tasks, type Task, type InsertTask, type UpdateTask } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getTasks(): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: UpdateTask): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  getActiveTasks(): Promise<Task[]>;
  getCompletedTasks(): Promise<Task[]>;
  getTimerTasks(): Promise<Task[]>;
}

export class DatabaseStorage implements IStorage {
  async getTasks(): Promise<Task[]> {
    const result = await db.select().from(tasks).orderBy(tasks.createdAt);
    return result.reverse();
  }

  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values({
        text: insertTask.text,
        completed: insertTask.completed ?? false,
        checkedAt: insertTask.checkedAt ?? null,
        completedAt: insertTask.completedAt ?? null,
        createdAt: Date.now(),
      })
      .returning();
    return task;
  }

  async updateTask(id: number, updateTask: UpdateTask): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updateTask)
      .where(eq(tasks.id, id))
      .returning();
    return task || undefined;
  }

  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getActiveTasks(): Promise<Task[]> {
    const result = await db
      .select()
      .from(tasks)
      .orderBy(tasks.createdAt);
    return result.filter(task => !task.completedAt).reverse();
  }

  async getCompletedTasks(): Promise<Task[]> {
    const result = await db
      .select()
      .from(tasks)
      .orderBy(tasks.completedAt);
    return result.filter(task => task.completedAt).reverse();
  }

  async getTimerTasks(): Promise<Task[]> {
    const result = await db
      .select()
      .from(tasks)
      .where(eq(tasks.completed, true))
      .orderBy(tasks.checkedAt);
    return result.filter(task => task.checkedAt && !task.completedAt);
  }
}

export const storage = new DatabaseStorage();
