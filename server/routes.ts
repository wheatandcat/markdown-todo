import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, updateTaskSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await storage.getTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get active tasks
  app.get("/api/tasks/active", async (req, res) => {
    try {
      const tasks = await storage.getActiveTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active tasks" });
    }
  });

  // Get completed tasks
  app.get("/api/tasks/completed", async (req, res) => {
    try {
      const tasks = await storage.getCompletedTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completed tasks" });
    }
  });

  // Get timer tasks
  app.get("/api/tasks/timers", async (req, res) => {
    try {
      const tasks = await storage.getTimerTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timer tasks" });
    }
  });

  // Create task
  app.post("/api/tasks", async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  // Update task
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateTaskSchema.parse(req.body);
      const task = await storage.updateTask(id, validatedData);
      
      if (!task) {
        res.status(404).json({ message: "Task not found" });
        return;
      }
      
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid task data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update task" });
      }
    }
  });

  // Delete task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id);
      
      if (!deleted) {
        res.status(404).json({ message: "Task not found" });
        return;
      }
      
      res.json({ message: "Task deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Bulk create tasks from markdown
  app.post("/api/tasks/markdown", async (req, res) => {
    try {
      const { markdownContent } = req.body;
      
      if (typeof markdownContent !== 'string') {
        res.status(400).json({ message: "Markdown content is required" });
        return;
      }

      // Parse markdown checkboxes
      const taskRegex = /^[ \t]*-[ \t]*\[([x\s])\][ \t]*(.+)$/gm;
      const matches = [...markdownContent.matchAll(taskRegex)];
      
      const tasks = [];
      for (const match of matches) {
        const text = match[2].trim();
        const completed = match[1] === 'x';
        const now = Date.now();
        
        const task = await storage.createTask({
          text,
          completed,
          checkedAt: completed ? now : undefined,
        });
        
        tasks.push(task);
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to parse markdown tasks" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
