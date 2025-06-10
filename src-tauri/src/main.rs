// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Child};
use std::sync::Mutex;
use tauri::Manager;

// ポート設定
const DEV_PORT: u16 = 3001;
const PROD_PORT: u16 = 5002;

// サーバープロセスの状態管理
struct ServerState {
    process: Mutex<Option<Child>>,
}

// サーバー接続確認
fn check_server_connection(port: u16) -> bool {
    use std::net::TcpStream;
    use std::time::Duration;
    
    TcpStream::connect_timeout(
        &format!("127.0.0.1:{}", port).parse().unwrap(),
        Duration::from_secs(3)
    ).is_ok()
}

// サーバー起動
fn start_server(is_dev: bool) -> Result<Option<Child>, Box<dyn std::error::Error>> {
    if is_dev {
        // 開発モードでは外部サーバー（port 3001）をチェック
        if check_server_connection(DEV_PORT) {
            println!("External development server detected on port 3001");
            return Ok(None);
        } else {
            return Err("Development server not found. Please start with: npm run dev".into());
        }
    }

    // プロダクションモードではサーバー起動を試行
    if check_server_connection(PROD_PORT) {
        println!("Server already running on port {}", PROD_PORT);
        return Ok(None);
    }

    // サーバー実行ファイルの検索
    let server_paths = [
        "./dist/index.js",
        "../dist/index.js",
        "./server/dist/index.js",
        "../server/dist/index.js",
    ];

    for path in &server_paths {
        if std::path::Path::new(path).exists() {
            println!("Starting server from: {}", path);
            
            let child = Command::new("node")
                .arg(path)
                .env("NODE_ENV", "production")
                .env("PORT", PROD_PORT.to_string())
                .spawn()?;
            
            // サーバー起動待機
            std::thread::sleep(std::time::Duration::from_secs(3));
            
            if check_server_connection(PROD_PORT) {
                return Ok(Some(child));
            }
        }
    }

    Err("No server executable found".into())
}

// Tauriコマンド
#[tauri::command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[tauri::command]
fn get_platform() -> String {
    std::env::consts::OS.to_string()
}

fn main() {
    let server_state = ServerState {
        process: Mutex::new(None),
    };

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .manage(server_state)
        .setup(|app| {
            let app_handle = app.handle().clone();
            
            // 開発モード判定
            let is_dev = cfg!(debug_assertions);
            
            // サーバー起動
            tauri::async_runtime::spawn(async move {
                match start_server(is_dev) {
                    Ok(Some(_process)) => {
                        if let Ok(_state) = app_handle.state::<ServerState>().process.lock() {
                            // プロセスを状態に保存（実際の実装では適切な管理が必要）
                            println!("Server started successfully");
                        }
                    }
                    Ok(None) => {
                        println!("Using external server");
                    }
                    Err(e) => {
                        eprintln!("Failed to start server: {}", e);
                        
                        // エラーダイアログ表示
                        if is_dev {
                            println!("Please start development server: npm run dev");
                        }
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![get_app_version, get_platform])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}