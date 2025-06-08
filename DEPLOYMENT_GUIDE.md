# TODOアプリ デプロイメントガイド

## 🚀 デプロイメント方法

### Replit Deployments での Web デプロイ
1. Replit で「Deploy」ボタンをクリック
2. 自動的にビルドとデプロイが実行されます
3. `.replit.app` ドメインでアクセス可能

### macOS ネイティブアプリ
```bash
# 開発モード（サーバー起動後）
./scripts/electron-only.sh

# 本番用ビルド
npm run electron:build
```

## 📱 プラットフォーム対応

| プラットフォーム | 対応状況 | アクセス方法 |
|---|---|---|
| **Web ブラウザ** | ✅ 完全対応 | Replit Deployments |
| **macOS ネイティブ** | ✅ 完全対応 | Electron アプリ |
| **Windows** | 🔄 設定可能 | Electron 設定変更 |
| **Linux** | 🔄 設定可能 | Electron 設定変更 |

## 🔐 認証システム

### デュアル認証対応
- **Replit Auth**: ワンクリック認証
- **Email/Password**: ローカル認証

### 環境変数
```bash
# 必須
DATABASE_URL=postgresql://...
SESSION_SECRET=your-secret-key

# Replit Auth用（オプション）
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-domain.replit.app
```

## 🎯 主要機能

### タスク管理
- ✅ Markdown対応テキスト入力
- ✅ リアルタイム更新
- ✅ 自動タイマー機能（1時間後自動完了）
- ✅ アクティブ/完了/タイマータスクの分類

### UI/UX
- ✅ レスポンシブデザイン
- ✅ ダークモード対応
- ✅ 日本語インターフェース
- ✅ Tailwind CSS スタイリング

### ネイティブアプリ体験
- ✅ macOS風メニュー（日本語）
- ✅ キーボードショートカット
- ✅ ウィンドウ管理
- ✅ バックグラウンド実行

## 🛠️ 技術スタック

### フロントエンド
- React + TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query
- Wouter (ルーティング)

### バックエンド
- Node.js + Express
- PostgreSQL (Neon)
- Drizzle ORM
- Passport.js

### デスクトップ
- Electron
- TypeScript
- ネイティブメニュー
- セキュアなプリロード

## 📊 パフォーマンス最適化

- ✅ React Query による効率的なデータフェッチ
- ✅ PostgreSQL インデックス最適化
- ✅ セッション管理の最適化
- ✅ 自動キャッシュ無効化

## 🎨 デザインシステム

- **カラーパレット**: HSL形式で統一
- **コンポーネント**: shadcn/ui ベース
- **アイコン**: Lucide React
- **フォント**: システムフォント

## 🔄 開発ワークフロー

```bash
# 開発開始
npm run dev

# Electron 開発
./scripts/dev-electron.sh

# Electron のみ起動
./scripts/electron-only.sh

# データベース更新
npm run db:push
```

## 📝 今後の拡張可能性

- Windows/Linux 向け Electron ビルド
- モバイルアプリ (React Native)
- PWA 対応
- リアルタイム同期
- チーム機能
- ファイル添付
- 通知システム

---

**作成日**: 2025年6月8日  
**バージョン**: 1.0.0  
**最終更新**: macOS Electron アプリ統合完了