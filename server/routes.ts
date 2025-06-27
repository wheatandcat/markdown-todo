import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema, updateTaskSchema } from "@shared/schema";
import { z } from "zod";
import fs from "fs";
import path from "path";
import os from "os";

export async function registerRoutes(app: Express): Promise<Server> {

  // Environment check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      const timerTasks = await storage.getTimerTasks();
      res.json({ 
        status: 'ok',
        environment: process.env.NODE_ENV,
        tauri: process.env.TAURI_ENV === "true",
        timestamp: new Date().toISOString(),
        timerTasksCount: timerTasks.length,
        timerTasks: timerTasks.map(task => ({
          id: task.id,
          text: task.text,
          checkedAt: task.checkedAt,
          timeRemaining: task.checkedAt ? Math.max(0, (60 * 60 * 1000) - (Date.now() - task.checkedAt)) : 0
        }))
      });
    } catch (error) {
      res.status(500).json({ 
        status: 'error',
        environment: process.env.NODE_ENV,
        tauri: process.env.TAURI_ENV === "true",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Debug logs endpoint
  app.get('/api/debug/logs', (req, res) => {
    try {
      const isTauri = process.env.TAURI_ENV === "true";
      if (!isTauri) {
        return res.json({ 
          error: "Logs only available in Tauri environment",
          environment: process.env.NODE_ENV 
        });
      }
      
      const homeDir = os.homedir();
      const logFile = path.join(homeDir, "Library", "Logs", "SmartTaskManager", "server.log");
      
      if (!fs.existsSync(logFile)) {
        return res.json({ 
          error: "Log file not found",
          path: logFile 
        });
      }
      
      // 最新の100行を取得
      const logContent = fs.readFileSync(logFile, 'utf-8');
      const lines = logContent.split('\n').filter(line => line.trim());
      const recentLines = lines.slice(-100); // 最新100行
      
      res.json({
        status: 'ok',
        logFile,
        lineCount: lines.length,
        recentLines,
        lastModified: fs.statSync(logFile).mtime
      });
    } catch (error) {
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  });

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
      const matches = [];
      let match;
      while ((match = taskRegex.exec(markdownContent)) !== null) {
        matches.push(match);
      }
      
      // Get existing tasks to avoid duplicates
      const existingTasks = await storage.getTasks();
      const existingTexts = new Set(existingTasks.map(t => t.text));
      
      const tasks = [];
      for (const match of matches) {
        const text = match[2].trim();
        const completed = match[1] === 'x';
        
        // Skip if task already exists
        if (existingTexts.has(text)) {
          const existingTask = existingTasks.find(t => t.text === text);
          if (existingTask) {
            // Update existing task if status changed
            if (existingTask.completed !== completed) {
              const updatedTask = await storage.updateTask(existingTask.id, {
                completed,
                checkedAt: completed ? Date.now() : null,
              });
              if (updatedTask) tasks.push(updatedTask);
            } else {
              tasks.push(existingTask);
            }
          }
          continue;
        }
        
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
  
  // Timer initialization log
  console.log(`[TIMER INIT] Starting timer interval (every 30 seconds) at ${new Date().toISOString()}`);
  console.log(`[TIMER INIT] Environment: NODE_ENV=${process.env.NODE_ENV}, TAURI_ENV=${process.env.TAURI_ENV}`);
  
  // Auto-complete timer tasks
  setInterval(async () => {
    try {
      const now = Date.now();
      const TIMER_DURATION = 60 * 60 * 1000; // 1 hour
      
      console.log(`[Timer Check] Running timer check at ${new Date().toISOString()}`);
      
      const timerTasks = await storage.getTimerTasks();
      console.log(`[Timer Check] Found ${timerTasks.length} timer tasks`);
      
      for (const task of timerTasks) {
        if (task.checkedAt && !task.completedAt) {
          const timeElapsed = now - task.checkedAt;
          const remainingTime = TIMER_DURATION - timeElapsed;
          
          console.log(`[Timer Check] Task "${task.text}": ${Math.round(remainingTime / 1000 / 60)}min remaining`);
          
          if (timeElapsed >= TIMER_DURATION) {
            console.log(`[Timer Complete] Auto-completing task: "${task.text}"`);
            await storage.updateTask(task.id, {
              completedAt: now,
            });
          }
        }
      }
    } catch (error) {
      console.error('Timer check error:', error);
    }
  }, 30000); // Check every 30 seconds
  
  return httpServer;
}
