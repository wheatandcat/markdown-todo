import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import fs from "fs";
import path from "path";
import os from "os";

const app = express();

// ログファイル設定
const setupLogFile = () => {
  const isTauri = process.env.TAURI_ENV === "true";
  if (isTauri) {
    const homeDir = os.homedir();
    const logDir = path.join(homeDir, "Library", "Logs", "SmartTaskManager");
    
    try {
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
      
      const logFile = path.join(logDir, "server.log");
      const logStream = fs.createWriteStream(logFile, { flags: 'a' });
      
      // コンソールログをファイルにも出力
      const originalLog = console.log;
      const originalError = console.error;
      
      console.log = (...args) => {
        const timestamp = new Date().toISOString();
        const message = `[${timestamp}] ${args.join(' ')}\n`;
        logStream.write(message);
        originalLog(...args);
      };
      
      console.error = (...args) => {
        const timestamp = new Date().toISOString();
        const message = `[${timestamp}] ERROR: ${args.join(' ')}\n`;
        logStream.write(message);
        originalError(...args);
      };
      
      console.log(`[LOG SETUP] Log file created at: ${logFile}`);
      return logFile;
    } catch (error) {
      console.error(`[LOG SETUP] Failed to setup log file:`, error);
    }
  }
  return null;
};

const logFilePath = setupLogFile();

// CORS設定 - Tauri環境とローカル開発対応
const isTauriEnv = process.env.TAURI_ENV === "true";
const isDev = process.env.NODE_ENV === "development";

if (isTauriEnv || isDev) {
  app.use((req, res, next) => {
    // Tauriの場合はtauri://で始まるオリジンも許可
    const allowedOrigins = isTauriEnv 
      ? ['http://localhost:5001', 'http://127.0.0.1:5001', 'tauri://localhost'] 
      : ['http://localhost:3001', 'http://localhost:5001', 'http://127.0.0.1:3001', 'http://127.0.0.1:5001'];
    
    const origin = req.headers.origin;
    
    if (isTauriEnv) {
      // Tauriの場合は特定のオリジンまたはtauri://プロトコルを許可
      if (!origin || origin.startsWith('tauri://') || allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin || 'tauri://localhost');
      } else {
        res.header('Access-Control-Allow-Origin', 'http://localhost:5001');
      }
    } else {
      if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
      }
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
    res.header('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Use different ports for different environments to avoid conflicts
  // Development: 3001, Production: 5002, Tauri: 5001
  let defaultPort = "5002";
  if (app.get("env") === "development") {
    defaultPort = "3001";
  } else if (process.env.TAURI_ENV === "true") {
    defaultPort = "5001";
  }
  const port = parseInt(process.env.PORT || defaultPort, 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})();
