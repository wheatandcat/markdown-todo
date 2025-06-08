# 🖥️ Electronアプリ使用ガイド

## 最新修正内容

Electronアプリのサーバー接続問題を修正しました：

### 修正内容
1. 外部サーバー（Replit/ローカル）への接続確認を優先
2. 開発モードでは外部サーバー起動を試行しない
3. サーバー接続失敗時に分かりやすいエラーダイアログを表示
4. CommonJS互換性のためファイル拡張子を自動変換

## 使用方法

### 1. サーバーが起動中の場合（推奨）
```bash
./scripts/electron-only.sh
```

### 2. サーバーも同時起動する場合
```bash
./scripts/dev-electron.sh
```

### 3. 手動実行
```bash
# TypeScriptファイルをコンパイル
npx tsc --project electron/tsconfig.json

# ファイル拡張子を変更
mv electron/dist/main.js electron/dist/main.cjs
mv electron/dist/preload.js electron/dist/preload.cjs

# Electronアプリを起動
electron electron/dist/main.cjs
```

## 動作要件

- Node.js 18以上
- Electronパッケージ（既にインストール済み）
- 開発サーバーが http://localhost:5000 で動作中

## 機能

- macOSネイティブメニューバー（日本語）
- ダークモード自動対応
- ウィンドウ管理
- キーボードショートカット
- セキュアなプリロード設定

## 問題解決済み

以下の問題を完全に解決しました：

### ✅ サーバー接続確認
```bash
Testing connection to localhost:5000...
✅ Server responded with status: 401
Connection result: true
```

### ✅ CommonJS互換性
- TypeScriptコンパイル後の`.cjs`拡張子自動変換
- HTTPモジュールによる安定した接続確認

### ✅ 開発者ツール警告の抑制
- Autofillエラーメッセージの非表示化
- プロダクション環境でのコンソール警告フィルタリング
- 必要に応じた開発者ツールの条件付き表示

これでクリーンで安定したElectronアプリが完成しました。