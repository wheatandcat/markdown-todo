import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertTaskSchema, updateTaskSchema, users, loginSchema, registerSchema } from "@shared/schema";
import { db } from "./db";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Environment check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'ok',
      environment: process.env.NODE_ENV,
      tauri: process.env.TAURI_ENV === "true",
      timestamp: new Date().toISOString()
    });
  });

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.isLocal ? req.user.id : req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Logout endpoint for local auth
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        res.status(500).json({ message: "ログアウトに失敗しました" });
        return;
      }
      
      // セッションを破棄
      req.session.destroy((err) => {
        if (err) {
          console.error("Session destroy error:", err);
          res.status(500).json({ message: "セッションの破棄に失敗しました" });
          return;
        }
        
        // Cookieもクリア
        res.clearCookie('connect.sid');
        res.json({ message: "ログアウトしました" });
      });
    });
  });

  // Local auth routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        res.status(400).json({ message: "このメールアドレスは既に登録されています" });
        return;
      }
      
      const user = await storage.createLocalUser(validatedData);
      
      // Create session for the new user
      req.login({ id: user.id, isLocal: true }, (err) => {
        if (err) {
          console.error("Session creation error:", err);
          res.status(500).json({ message: "ログインに失敗しました" });
          return;
        }
        console.log("Session created successfully for user:", user.id);
        console.log("Session ID:", req.sessionID);
        res.json({ 
          user: { id: user.id, email: user.email, firstName: user.firstName },
          sessionId: req.sessionID 
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "入力データが無効です", errors: error.errors });
      } else {
        console.error("Registration error:", error);
        res.status(500).json({ message: "登録に失敗しました" });
      }
    }
  });

  app.post('/api/auth/local-login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.verifyPassword(validatedData.email, validatedData.password);
      if (!user) {
        res.status(401).json({ message: "メールアドレスまたはパスワードが正しくありません" });
        return;
      }
      
      // Create session for the user
      req.login({ id: user.id, isLocal: true }, (err) => {
        if (err) {
          console.error("Login session creation error:", err);
          res.status(500).json({ message: "ログインに失敗しました" });
          return;
        }
        console.log("Login session created successfully for user:", user.id);
        console.log("Session ID:", req.sessionID);
        res.json({ 
          user: { id: user.id, email: user.email, firstName: user.firstName },
          sessionId: req.sessionID 
        });
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "入力データが無効です", errors: error.errors });
      } else {
        console.error("Login error:", error);
        res.status(500).json({ message: "ログインに失敗しました" });
      }
    }
  });
  // Get all tasks
  app.get("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.isLocal ? req.user.id : req.user.claims.sub;
      const tasks = await storage.getTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get active tasks
  app.get("/api/tasks/active", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.isLocal ? req.user.id : req.user.claims.sub;
      const tasks = await storage.getActiveTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch active tasks" });
    }
  });

  // Get completed tasks
  app.get("/api/tasks/completed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.isLocal ? req.user.id : req.user.claims.sub;
      const tasks = await storage.getCompletedTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch completed tasks" });
    }
  });

  // Get timer tasks
  app.get("/api/tasks/timers", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.isLocal ? req.user.id : req.user.claims.sub;
      const tasks = await storage.getTimerTasks(userId);
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch timer tasks" });
    }
  });

  // Create task
  app.post("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.isLocal ? req.user.id : req.user.claims.sub;
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData, userId);
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
  app.patch("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.isLocal ? req.user.id : req.user.claims.sub;
      const id = parseInt(req.params.id);
      const validatedData = updateTaskSchema.parse(req.body);
      const task = await storage.updateTask(id, validatedData, userId);
      
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
  app.delete("/api/tasks/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.isLocal ? req.user.id : req.user.claims.sub;
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteTask(id, userId);
      
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
  app.post("/api/tasks/markdown", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.isLocal ? req.user.id : req.user.claims.sub;
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
      const existingTasks = await storage.getTasks(userId);
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
              }, userId);
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
        }, userId);
        
        tasks.push(task);
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to parse markdown tasks" });
    }
  });

  const httpServer = createServer(app);
  
  // Auto-complete timer tasks for all users
  setInterval(async () => {
    try {
      // Get all users and check their timer tasks
      const allUsers = await db.select().from(users);
      const now = Date.now();
      const TIMER_DURATION = 60 * 60 * 1000; // 1 hour
      
      for (const user of allUsers) {
        const timerTasks = await storage.getTimerTasks(user.id);
        
        for (const task of timerTasks) {
          if (task.checkedAt && !task.completedAt) {
            const timeElapsed = now - task.checkedAt;
            if (timeElapsed >= TIMER_DURATION) {
              await storage.updateTask(task.id, {
                completedAt: now,
              }, user.id);
            }
          }
        }
      }
    } catch (error) {
      console.error('Timer check error:', error);
    }
  }, 30000); // Check every 30 seconds
  
  return httpServer;
}
