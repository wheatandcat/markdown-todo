import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from "@shared/schema";
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import fs from 'fs';
import os from 'os';

// データベースファイルのパス
function getDbPath(): string {
  const isTauriEnv = process.env.TAURI_ENV === "true";
  
  if (isTauriEnv) {
    // Tauriアプリの場合、ユーザーのアプリデータディレクトリを使用
    const userDataDir = path.join(os.homedir(), 'Library', 'Application Support', 'com.smarttask.manager');
    
    // ディレクトリが存在しない場合は作成
    if (!fs.existsSync(userDataDir)) {
      fs.mkdirSync(userDataDir, { recursive: true });
    }
    
    return path.join(userDataDir, 'tasks.db');
  } else {
    // 通常の開発・本番環境では現在のディレクトリを使用
    return path.join(process.cwd(), 'tasks.db');
  }
}

const dbPath = getDbPath();
console.log('Database path:', dbPath);

// SQLiteデータベースの初期化
const sqlite = new Database(dbPath);
export const db = drizzle(sqlite, { schema });

// テーブルが存在しない場合は作成
try {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      text TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      checked_at INTEGER,
      completed_at INTEGER,
      created_at INTEGER NOT NULL
    )
  `);
} catch (error) {
  console.error('Database initialization error:', error);
}