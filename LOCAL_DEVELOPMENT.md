# ローカル開発ガイド

## ポート競合の解決

Replit環境ではポート5000が既に使用されているため、ローカル開発では自動的にポート3001を使用します。

## 開発方法

### 1. ローカルサーバーのみ起動
```bash
# ポート3001でサーバー起動
./scripts/dev-local.sh
```

### 2. Electronアプリと一緒に開発
```bash
# サーバー自動検出でElectronアプリ起動
./scripts/dev-electron.sh
```

### 3. 既存サーバーに接続
```bash
# Replit（5000）またはローカル（3001）サーバーに自動接続
./scripts/electron-only.sh
```

## ポート設定詳細

| 環境 | ポート | 用途 |
|---|---|---|
| Replit | 5000 | Web版開発・デプロイ |
| ローカル | 3001 | ローカル開発（競合回避） |
| 本番 | 環境変数 | カスタマイズ可能 |

## 環境変数

```bash
# ローカル開発
export PORT=3001
export NODE_ENV=development

# 本番環境
export PORT=8080
export NODE_ENV=production
```

## トラブルシューティング

### ポート競合エラー
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:5000
```

**解決方法**: 
1. `./scripts/dev-local.sh` を使用してポート3001で起動
2. または他のプロセスを停止: `lsof -ti:5000 | xargs kill -9`

### ローカル認証問題
```
GET /api/auth/user 401 in 3ms :: {"message":"Unauthorized"}
```

**原因**: セッションクッキーの`secure: true`設定がHTTPローカル環境で機能しない

**解決済み**: `secure: process.env.NODE_ENV === 'production'`に修正
- 本番環境：HTTPS必須（secure: true）
- 開発環境：HTTP対応（secure: false）

### Electron接続エラー
Electronアプリが正しいポートに接続できない場合：

```bash
# 明示的にポート指定
PORT=3001 ./scripts/electron-only.sh
```

### 認証方式について
- **Replitユーザー**: OAuth認証のみ（パスワード不要）
- **ローカルユーザー**: メール/パスワード認証
- **混在利用**: 同じメールで両方式併用不可

## 開発ワークフロー

```bash
# 1. ローカル開発開始
./scripts/dev-local.sh

# 2. 別ターミナルでElectronテスト
./scripts/electron-only.sh

# 3. データベース更新時
npm run db:push
```

## デバッグモード

開発者ツールを有効にしたい場合：

```bash
ELECTRON_DEBUG=true ./scripts/electron-only.sh
```