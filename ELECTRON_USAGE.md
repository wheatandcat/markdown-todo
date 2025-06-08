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

これでCommonJS互換性の問題が解決され、正常にElectronアプリが起動するはずです。