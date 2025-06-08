import { app, BrowserWindow, Menu, shell, ipcMain } from 'electron';
import { join } from 'path';
import { spawn, ChildProcess } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
const PORT = 5000;

function createMainWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, 'preload.cjs'),
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  });

  // Load the app
  const startUrl = isDev 
    ? `http://localhost:${PORT}` 
    : `file://${join(__dirname, '../dist/index.html')}`;
  
  mainWindow.loadURL(startUrl);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    
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
    
    const req = http.get(`http://localhost:${PORT}/api/auth/user`, (res: any) => {
      resolve(true); // Server is responding
    });
    
    req.on('error', () => {
      resolve(false); // Server not running
    });
    
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

function startServer(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    // Always check if external server is available first
    const serverRunning = await checkServerConnection();
    
    if (serverRunning) {
      console.log('External server detected, using existing connection');
      resolve();
      return;
    }

    if (isDev) {
      console.log('Development mode: No external server found');
      reject(new Error('Please start the development server first with: npm run dev'));
      return;
    }

    // Only try to start embedded server in packaged production app
    const serverPath = join(process.resourcesPath, 'server', 'index.js');
    console.log(`Starting embedded server from: ${serverPath}`);
    
    serverProcess = spawn('node', [serverPath], {
      env: { ...process.env, NODE_ENV: 'production' },
      stdio: 'pipe'
    });

    serverProcess.stdout?.on('data', (data) => {
      console.log(`Server: ${data}`);
      if (data.toString().includes('serving on port')) {
        resolve();
      }
    });

    serverProcess.stderr?.on('data', (data) => {
      console.error(`Server Error: ${data}`);
    });

    serverProcess.on('error', (error) => {
      console.error('Failed to start embedded server:', error);
      reject(error);
    });

    setTimeout(() => {
      resolve();
    }, 10000);
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