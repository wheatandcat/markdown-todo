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

## 🛠️ トラブルシューティング

### Electronアプリが真っ白になる場合

**症状**: Electronアプリが起動するが画面が真っ白で何も表示されない

**原因と解決方法**:

1. **サーバー接続エラー**
   ```bash
   # サーバーが起動しているか確認
   curl http://localhost:5000  # Replit環境
   curl http://localhost:3001  # ローカル環境
   
   # 解決方法: サーバーを先に起動
   npm run dev                 # Replit環境
   ./scripts/dev-local.sh     # ローカル環境
   ```

2. **ポート設定ミスマッチ**
   ```bash
   # 自動ポート検出スクリプトを使用
   ./scripts/electron-only.sh  # ポート5000/3001を自動検出
   
   # 手動でポート指定
   PORT=3001 electron electron/dist/main.cjs
   ```

3. **認証状態の問題**
   - ブラウザでログイン状態を確認
   - 必要に応じて再ログイン
   - セッションの有効期限切れの可能性

4. **デバッグ方法**
   ```bash
   # 開発者ツールを有効にしてエラー確認
   ELECTRON_DEBUG=true ./scripts/electron-only.sh
   ```

### エラーメッセージの対処

**Connection Error画面が表示される場合**:
- サーバーが停止している
- ポート番号が間違っている
- ファイアウォールでブロックされている

**解決順序**:
1. サーバー起動確認
2. ポート設定確認  
3. Electronアプリ再起動
4. 開発者ツールでエラーログ確認

これで白い画面問題は解決できます。