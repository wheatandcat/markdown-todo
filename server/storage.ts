import { tasks, type Task, type InsertTask, type UpdateTask } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private tasks: Map<number, Task>;
  private currentId: number;

  constructor() {
    this.tasks = new Map();
    this.currentId = 1;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values()).sort((a, b) => b.createdAt - a.createdAt);
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentId++;
    const task: Task = {
      ...insertTask,
      id,
      createdAt: Date.now(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, updateTask: UpdateTask): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;

    const updatedTask: Task = { ...task, ...updateTask };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async getActiveTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => !task.completedAt)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  async getCompletedTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.completedAt)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  }

  async getTimerTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.completed && task.checkedAt && !task.completedAt)
      .sort((a, b) => (a.checkedAt || 0) - (b.checkedAt || 0));
  }
}

export const storage = new MemStorage();
