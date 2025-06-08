import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron';
import { join } from 'path';
import { spawn, ChildProcess } from 'child_process';
import { createStaticServer } from './static-server';

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = parseInt(process.env.ELECTRON_PORT || "5001", 10); // Use different port for Electron

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'TODOアプリ - タスク管理',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.js'),
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  // Load the app with fallback strategy
  let startUrl: string;
  
  if (isDev) {
    startUrl = `http://localhost:5000`; // Always use 5000 in dev mode
  } else {
    // Try multiple paths for packaged app
    const fs = require('fs');
    const possiblePaths = [
      join(__dirname, '../dist/public/index.html'),
      join(process.resourcesPath, 'dist/public/index.html'),
      join(process.resourcesPath, 'app/dist/public/index.html')
    ];
    
    let htmlPath = '';
    for (const path of possiblePaths) {
      if (fs.existsSync(path)) {
        htmlPath = path;
        break;
      }
    }
    
    if (htmlPath) {
      startUrl = `file://${htmlPath}`;
    } else {
      // Fallback to localhost if files not found
      startUrl = `http://localhost:${PORT}`;
    }
  }
  
  console.log(`Loading URL: ${startUrl}`);
  console.log(`__dirname: ${__dirname}`);
  console.log(`isDev: ${isDev}`);
  console.log(`app.isPackaged: ${app.isPackaged}`);
  
  // Add timeout for loading
  const loadTimeout = setTimeout(() => {
    console.error('Page load timeout - showing error page');
    mainWindow?.loadFile(join(__dirname, '../assets/error.html'));
  }, 10000);

  mainWindow.loadURL(startUrl);

  // Debug: Log load events
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    clearTimeout(loadTimeout);
    console.error(`Failed to load ${validatedURL}: ${errorCode} - ${errorDescription}`);
    
    // Show error page for connection issues
    if (errorCode === -102 || errorCode === -7) { // Connection refused or timed out
      const errorHtml = `
        <html>
          <head><title>Connection Error</title></head>
          <body style="font-family: system-ui; padding: 40px; text-align: center;">
            <h1>サーバーに接続できません</h1>
            <p>開発サーバーが起動していることを確認してください</p>
            <p>Port: ${PORT}</p>
            <p>URL: ${startUrl}</p>
            <button onclick="location.reload()">再試行</button>
          </body>
        </html>
      `;
      mainWindow?.loadURL(`data:text/html,${encodeURIComponent(errorHtml)}`);
    }
  });

  mainWindow.webContents.on('did-finish-load', () => {
    clearTimeout(loadTimeout);
    console.log('Page loaded successfully');
  });

  // Log console messages in development
  if (isDev) {
    mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
      console.log(`Console [${level}]: ${message}`);
    });
  } else {
    // Suppress console warnings in production
    mainWindow.webContents.on('console-message', (event, level, message) => {
      if (level >= 2 && (message.includes('Autofill') || message.includes('devtools'))) {
        event.preventDefault();
      }
    });
  }

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
    // Open dev tools in development for debugging
    if (isDev) {
      mainWindow?.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

async function checkServerConnection(): Promise<boolean> {
  return new Promise((resolve) => {
    const http = require('http');
    
    // In development, check port 5000. In production, check our own port
    const checkPort = isDev ? 5000 : PORT;
    
    const req = http.get(`http://localhost:${checkPort}`, (res: any) => {
      resolve(true); // Server is responding
    });
    
    req.on('error', () => {
      resolve(false); // Server not running
    });
    
    req.setTimeout(3000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startServer(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // Check if external server is available first
    const serverRunning = await checkServerConnection();
    
    if (serverRunning) {
      console.log('External server detected, using existing connection');
      resolve();
      return;
    }

    if (isDev) {
      console.log('Development mode: External server required on port 5000');
      reject(new Error('Please start the development server first with: npm run dev'));
      return;
    }

    // In production, start static file server as fallback
    try {
      console.log('Starting static file server for packaged app');
      await createStaticServer(PORT);
      resolve();
    } catch (staticServerError) {
      console.error('Static server failed, trying embedded server:', staticServerError);
      
      // Try embedded server as last resort
      const possibleServerPaths = [
        join(process.resourcesPath, 'dist', 'index.js'),
        join(process.resourcesPath, 'app', 'dist', 'index.js'),
        join(__dirname, '..', 'dist', 'index.js'),
        join(process.cwd(), 'dist', 'index.js')
      ];

      let serverPath = '';
      const fs = require('fs');
      
      for (const path of possibleServerPaths) {
        if (fs.existsSync(path)) {
          serverPath = path;
          break;
        }
      }

      if (!serverPath) {
        console.error('No server executable found');
        reject(new Error('No server available'));
        return;
      }

      console.log(`Starting embedded server from: ${serverPath}`);
      
      serverProcess = spawn('node', [serverPath], {
        env: { 
          ...process.env, 
          NODE_ENV: 'production',
          PORT: '5002', // Use port 5002 for production server
          DATABASE_URL: process.env.DATABASE_URL || 'sqlite:app.db'
        },
        stdio: 'pipe'
      });

      let resolved = false;

      serverProcess.stdout?.on('data', (data) => {
        console.log(`Server: ${data}`);
        if (data.toString().includes('serving on port') && !resolved) {
          resolved = true;
          resolve();
        }
      });

      serverProcess.stderr?.on('data', (data) => {
        console.error(`Server Error: ${data}`);
      });

      serverProcess.on('error', (error) => {
        console.error('Failed to start embedded server:', error);
        if (!resolved) {
          resolved = true;
          reject(error);
        }
      });

      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      }, 10000);
    }
  });
}

function createMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'スマートタスク管理',
      submenu: [
        {
          label: 'アプリについて',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'サービス',
          role: 'services'
        },
        { type: 'separator' },
        {
          label: 'スマートタスク管理を隠す',
          accelerator: 'Command+H',
          role: 'hide'
        },
        {
          label: 'ほかを隠す',
          accelerator: 'Command+Shift+H',
          role: 'hideOthers'
        },
        {
          label: 'すべてを表示',
          role: 'unhide'
        },
        { type: 'separator' },
        {
          label: '終了',
          accelerator: 'Command+Q',
          click: () => {
            app.quit();
          }
        }
      ]
    },
    {
      label: '編集',
      submenu: [
        { label: '取り消し', accelerator: 'Command+Z', role: 'undo' },
        { label: 'やり直し', accelerator: 'Shift+Command+Z', role: 'redo' },
        { type: 'separator' },
        { label: 'カット', accelerator: 'Command+X', role: 'cut' },
        { label: 'コピー', accelerator: 'Command+C', role: 'copy' },
        { label: 'ペースト', accelerator: 'Command+V', role: 'paste' },
        { label: 'すべて選択', accelerator: 'Command+A', role: 'selectAll' }
      ]
    },
    {
      label: '表示',
      submenu: [
        { label: '再読み込み', accelerator: 'Command+R', role: 'reload' },
        { label: '強制再読み込み', accelerator: 'Command+Shift+R', role: 'forceReload' },
        { label: '開発者ツール', accelerator: 'Command+Option+I', role: 'toggleDevTools' },
        { type: 'separator' },
        { label: '実際のサイズ', accelerator: 'Command+0', role: 'resetZoom' },
        { label: '拡大', accelerator: 'Command+Plus', role: 'zoomIn' },
        { label: '縮小', accelerator: 'Command+-', role: 'zoomOut' },
        { type: 'separator' },
        { label: 'フルスクリーン', accelerator: 'Control+Command+F', role: 'togglefullscreen' }
      ]
    },
    {
      label: 'ウィンドウ',
      submenu: [
        { label: '最小化', accelerator: 'Command+M', role: 'minimize' },
        { label: '閉じる', accelerator: 'Command+W', role: 'close' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// App event handlers
app.whenReady().then(async () => {
  try {
    await startServer();
    createMainWindow();
    createMenu();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    
    // Show error dialog to user
    const { dialog } = require('electron');
    dialog.showErrorBox(
      'サーバー接続エラー',
      'タスク管理サーバーに接続できません。\n\n開発サーバーを起動してから再度お試しください:\nnpm run dev'
    );
    
    app.quit();
    return;
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// IPC handlers
ipcMain.handle('app-version', () => {
  return app.getVersion();
});

ipcMain.handle('platform', () => {
  return process.platform;
});