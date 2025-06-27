// Prevents additional console window on Windows in release, DO NOT REMOVE!!
// NOTE: Commented out to enable console logging in production
// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Command, Child};
use std::sync::Mutex;
use std::fs::OpenOptions;
use std::io::Write;
use tauri::Manager;
use log::{info, error, warn, debug};

// ポート設定
const DEV_PORT: u16 = 3001;
const PROD_PORT: u16 = 5001;

// サーバープロセスの状態管理
struct ServerState {
    process: Mutex<Option<Child>>,
}

// ログファイル出力
fn log_to_file(message: &str) {
    if let Ok(mut file) = OpenOptions::new()
        .create(true)
        .append(true)
        .open("/tmp/tauri-debug.log") {
        let timestamp = chrono::Utc::now().format("%Y-%m-%d %H:%M:%S");
        let _ = writeln!(file, "[{}] {}", timestamp, message);
    }
}

// サーバー接続確認
fn check_server_connection(port: u16) -> bool {
    use std::net::TcpStream;
    use std::time::Duration;
    
    let result = TcpStream::connect_timeout(
        &format!("127.0.0.1:{}", port).parse().unwrap(),
        Duration::from_secs(3)
    ).is_ok();
    
    let status = if result { "SUCCESS" } else { "FAILED" };
    let message = format!("Server connection check on port {}: {}", port, status);
    info!("{}", message);
    log_to_file(&message);
    
    result
}

// サーバー起動（AppHandle付き）
fn start_server_with_app_handle(is_dev: bool, app_handle: &tauri::AppHandle) -> Result<Option<Child>, Box<dyn std::error::Error>> {
    let mode = if is_dev { "DEVELOPMENT" } else { "PRODUCTION" };
    let message = format!("=== SERVER STARTUP ATTEMPT ({}) ===", mode);
    info!("{}", message);
    log_to_file(&message);
    
    if is_dev {
        // 開発モードでは外部サーバー（port 3001）をチェック
        let message = "Checking for external development server...";
        info!("{}", message);
        log_to_file(message);
        
        if check_server_connection(DEV_PORT) {
            let message = "External development server detected on port 3001";
            info!("{}", message);
            log_to_file(message);
            return Ok(None);
        } else {
            let error_msg = "Development server not found. Please start with: npm run dev";
            error!("{}", error_msg);
            log_to_file(error_msg);
            return Err(error_msg.into());
        }
    }

    // プロダクションモードではサーバー起動を試行
    let message = format!("Checking if server is already running on port {}...", PROD_PORT);
    info!("{}", message);
    log_to_file(&message);
    
    if check_server_connection(PROD_PORT) {
        let message = format!("Server already running on port {}", PROD_PORT);
        info!("{}", message);
        log_to_file(&message);
        return Ok(None);
    }

    // Tauriリソースからサーバーファイルを取得
    match app_handle.path().resource_dir() {
        Ok(resource_path) => {
            let message = format!("Resource directory found: {:?}", resource_path);
            info!("{}", message);
            log_to_file(&message);
            
            // Try multiple possible paths for the server file
            let server_paths = [
                resource_path.join("index.js"),
                resource_path.join("_up_").join("dist").join("index.js"),
                resource_path.join("dist").join("index.js"),
            ];
            
            let mut server_file_found: Option<std::path::PathBuf> = None;
            
            for path in &server_paths {
                let message = format!("Checking server file path: {:?}", path);
                info!("{}", message);
                log_to_file(&message);
                
                if path.exists() {
                    server_file_found = Some(path.clone());
                    break;
                }
            }
            
            if let Some(server_file) = server_file_found {
                let message = format!("Server file found! Starting server from: {:?}", server_file);
                info!("{}", message);
                log_to_file(&message);
                
                // Try to find node binary in common locations
                // Start with system PATH first to get compatible version
                let node_paths = [
                    "node", // Try system PATH first (usually more compatible)
                    "/usr/local/bin/node",
                    "/usr/bin/node",
                    "/opt/homebrew/bin/node", // Last resort as it might be newer
                ];
                
                let mut node_command = None;
                for node_path in &node_paths {
                    if std::path::Path::new(node_path).exists() || *node_path == "node" {
                        node_command = Some(*node_path);
                        break;
                    }
                }
                
                if let Some(node_cmd) = node_command {
                    let message = format!("Using Node.js from: {}", node_cmd);
                    info!("{}", message);
                    log_to_file(&message);
                    
                    match Command::new(node_cmd)
                        .arg(&server_file)
                        .env("NODE_ENV", "production")
                        .env("PORT", PROD_PORT.to_string())
                        .env("TAURI_ENV", "true")
                        .stdout(std::process::Stdio::null())
                        .stderr(std::process::Stdio::null())
                        .spawn() {
                    Ok(child) => {
                        let message = format!("Server process started with PID: {:?}", child.id());
                        info!("{}", message);
                        log_to_file(&message);
                        
                        // サーバー起動待機
                        let message = "Waiting 5 seconds for server startup...";
                        info!("{}", message);
                        log_to_file(message);
                        std::thread::sleep(std::time::Duration::from_secs(5));
                        
                        if check_server_connection(PROD_PORT) {
                            let message = "Server startup successful!";
                            info!("{}", message);
                            log_to_file(message);
                            return Ok(Some(child));
                        } else {
                            let message = "Server started but connection check failed";
                            error!("{}", message);
                            log_to_file(message);
                        }
                    },
                    Err(e) => {
                        let message = format!("Failed to start server process: {}", e);
                        error!("{}", message);
                        log_to_file(&message);
                    }
                }
                } else {
                    let message = "Node.js not found in any common location";
                    error!("{}", message);
                    log_to_file(message);
                }
            } else {
                let message = "Server file not found in any of the expected resource paths";
                error!("{}", message);
                log_to_file(message);
            }
        },
        Err(e) => {
            let message = format!("Failed to get resource directory: {}", e);
            error!("{}", message);
            log_to_file(&message);
        }
    }

    // フォールバック: 従来のパス検索
    let message = "Attempting fallback server startup...";
    info!("{}", message);
    log_to_file(message);
    start_server_fallback()
}

// サーバー起動（フォールバック）
fn start_server_fallback() -> Result<Option<Child>, Box<dyn std::error::Error>> {
    let message = "=== FALLBACK SERVER STARTUP ===";
    info!("{}", message);
    log_to_file(message);
    
    // サーバー実行ファイルの検索
    let server_paths = [
        "./dist/index.js",
        "../dist/index.js",
        "./server/dist/index.js",
        "../server/dist/index.js",
        "./index.js",  // Tauriバンドル内のリソース
        "../index.js", // Tauriバンドル内のリソース
    ];

    for path in &server_paths {
        let message = format!("Checking path: {}", path);
        debug!("{}", message);
        log_to_file(&message);
        
        if std::path::Path::new(path).exists() {
            let message = format!("Found server file! Starting from: {}", path);
            info!("{}", message);
            log_to_file(&message);
            
            // Try to find node binary for fallback
            let node_paths = [
                "node", // Try system PATH first (usually more compatible)
                "/usr/local/bin/node",
                "/usr/bin/node",
                "/opt/homebrew/bin/node", // Last resort as it might be newer
            ];
            
            let mut node_command = None;
            for node_path in &node_paths {
                if std::path::Path::new(node_path).exists() || *node_path == "node" {
                    node_command = Some(*node_path);
                    break;
                }
            }
            
            if let Some(node_cmd) = node_command {
                match Command::new(node_cmd)
                    .arg(path)
                    .env("NODE_ENV", "production")
                    .env("PORT", PROD_PORT.to_string())
                    .env("TAURI_ENV", "true")
                    .stdout(std::process::Stdio::null())
                    .stderr(std::process::Stdio::null())
                    .spawn() {
                Ok(child) => {
                    let message = format!("Server process started from {} with PID: {:?}", path, child.id());
                    info!("{}", message);
                    log_to_file(&message);
                    
                    // サーバー起動待機
                    let message = "Waiting 5 seconds for fallback server startup...";
                    info!("{}", message);
                    log_to_file(message);
                    std::thread::sleep(std::time::Duration::from_secs(5));
                    
                    if check_server_connection(PROD_PORT) {
                        let message = "Fallback server startup successful!";
                        info!("{}", message);
                        log_to_file(message);
                        return Ok(Some(child));
                    } else {
                        let message = format!("Fallback server from {} started but connection failed", path);
                        error!("{}", message);
                        log_to_file(&message);
                    }
                },
                Err(e) => {
                    let message = format!("Failed to start server from {}: {}", path, e);
                    error!("{}", message);
                    log_to_file(&message);
                }
            }
            } else {
                let message = "Node.js not found for fallback server startup";
                error!("{}", message);
                log_to_file(message);
            }
        } else {
            let message = format!("Path does not exist: {}", path);
            debug!("{}", message);
            log_to_file(&message);
        }
    }

    let error_msg = "No server executable found in any fallback path";
    error!("{}", error_msg);
    log_to_file(error_msg);
    Err(error_msg.into())
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
    // ログ初期化
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .init();
    
    let startup_message = "=== TAURI APPLICATION STARTING ===";
    info!("{}", startup_message);
    log_to_file(startup_message);
    
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
            let mode_message = format!("Running in {} mode", if is_dev { "DEVELOPMENT" } else { "PRODUCTION" });
            info!("{}", mode_message);
            log_to_file(&mode_message);
            
            // サーバー起動
            tauri::async_runtime::spawn(async move {
                match start_server_with_app_handle(is_dev, &app_handle) {
                    Ok(Some(_process)) => {
                        if let Ok(_state) = app_handle.state::<ServerState>().process.lock() {
                            // プロセスを状態に保存（実際の実装では適切な管理が必要）
                            let message = "✅ Server started successfully";
                            info!("{}", message);
                            log_to_file(message);
                        }
                    }
                    Ok(None) => {
                        let message = "ℹ️ Using external server";
                        info!("{}", message);
                        log_to_file(message);
                    }
                    Err(e) => {
                        let error_message = format!("❌ Failed to start server: {}", e);
                        error!("{}", error_message);
                        log_to_file(&error_message);
                        
                        // エラーダイアログ表示
                        if is_dev {
                            let dev_message = "Please start development server: npm run dev";
                            warn!("{}", dev_message);
                            log_to_file(dev_message);
                        } else {
                            let prod_message = "Server startup failed in production mode. Check if Node.js is installed and dist/index.js exists.";
                            error!("{}", prod_message);
                            log_to_file(prod_message);
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