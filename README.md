# スマートタスク管理 - Smart Task Manager

Markdownで作成したタスクが1時間後に自動完了する、生産性を向上させるタスク管理アプリケーションです。

## 主な機能

### 🚀 デュアル認証システム
- **メールアドレス認証**: 独自のアカウント作成・ログイン
- **Replit認証**: Replitアカウントでのワンクリックログイン

### 📝 Markdownタスク管理
- Markdownエディターでタスクを作成・編集
- チェックボックス形式でタスクステータス管理
- リアルタイムプレビュー機能

### ⏰ 自動完了システム
- チェックしたタスクが1時間後に自動的に完了状態に変更
- タイマー機能付きタスクの進捗追跡

### 📊 タスク分類
- **アクティブタスク**: 進行中のタスク
- **完了タスク**: 完了済みのタスク  
- **タイマータスク**: 1時間カウントダウン中のタスク

### 🎨 モダンUI/UX
- 日本語対応インターフェース
- ダークモード/ライトモード切替
- レスポンシブデザイン（モバイル対応）
- shadcn/ui + Tailwind CSSによる美しいデザイン

## 技術スタック

### フロントエンド
- **React 18** + **TypeScript**
- **Vite** - 高速開発サーバー
- **TanStack Query** - データフェッチング・キャッシュ管理
- **wouter** - 軽量ルーティング
- **React Hook Form** + **Zod** - フォーム管理・バリデーション
- **shadcn/ui** - UIコンポーネントライブラリ
- **Tailwind CSS** - スタイリング
- **Lucide React** - アイコン

### バックエンド
- **Node.js** + **Express**
- **TypeScript**
- **Drizzle ORM** - タイプセーフなORM
- **PostgreSQL** - データベース
- **bcryptjs** - パスワードハッシュ化
- **express-session** - セッション管理

### 認証
- **Replit Auth (OpenID Connect)** - Replitアカウント認証
- **Passport.js** - 認証ミドルウェア
- **ローカル認証** - メールアドレス・パスワード認証

## データベース設計

### Users テーブル
```sql
- id: varchar (primary key)
- email: varchar (unique)
- firstName: varchar
- lastName: varchar
- profileImageUrl: varchar
- authType: varchar ('replit' | 'local')
- passwordHash: varchar (ローカル認証用)
- createdAt: timestamp
- updatedAt: timestamp
```

### Tasks テーブル
```sql
- id: serial (primary key)
- userId: varchar (foreign key)
- text: text
- completed: boolean
- checkedAt: bigint (Unix timestamp)
- createdAt: timestamp
- updatedAt: timestamp
```

### Sessions テーブル
```sql
- sid: varchar (primary key)
- sess: jsonb
- expire: timestamp
```

## API エンドポイント

### 認証
- `GET /api/auth/user` - 現在のユーザー情報取得
- `POST /api/auth/register` - 新規ユーザー登録
- `POST /api/auth/local-login` - ローカルログイン
- `GET /api/login` - Replitログイン開始
- `GET /api/logout` - ログアウト

### タスク管理
- `GET /api/tasks` - 全タスク取得
- `GET /api/tasks/active` - アクティブタスク取得
- `GET /api/tasks/completed` - 完了タスク取得
- `GET /api/tasks/timers` - タイマータスク取得
- `POST /api/tasks` - タスク作成
- `PATCH /api/tasks/:id` - タスク更新
- `DELETE /api/tasks/:id` - タスク削除
- `POST /api/tasks/markdown` - Markdownからタスク一括作成

## 開発環境セットアップ

### 前提条件
- Node.js 18以上
- PostgreSQL データベース

### 環境変数
```bash
DATABASE_URL=postgresql://username:password@localhost:5432/database
SESSION_SECRET=your-session-secret
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-domain.replit.app
```

### インストール・起動
```bash
# 依存関係インストール
npm install

# データベースマイグレーション
npm run db:push

# 開発サーバー起動
npm run dev
```

## ディレクトリ構成

```
├── client/                 # フロントエンド
│   └── src/
│       ├── components/     # Reactコンポーネント
│       ├── hooks/         # カスタムHooks
│       ├── lib/           # ユーティリティ
│       └── pages/         # ページコンポーネント
├── server/                # バックエンド
│   ├── index.ts          # サーバーエントリーポイント
│   ├── routes.ts         # APIルート
│   ├── storage.ts        # データアクセス層
│   ├── db.ts             # データベース接続
│   └── replitAuth.ts     # Replit認証設定
├── shared/               # 共有型定義
│   └── schema.ts         # Drizzle スキーマ
└── package.json
```

## 主な特徴

### 1. デュアル認証システム
ユーザーは好みに応じて2つの認証方法から選択可能：
- Replitアカウントでの簡単ログイン
- メールアドレス・パスワードでの独立したアカウント

### 2. 自動タスク完了機能
チェックされたタスクは1時間後に自動的に完了状態に移行。集中力を維持しながら達成感を得られる仕組み。

### 3. Markdownベースエディター
使い慣れたMarkdown記法でタスクを作成。チェックボックス記法（`- [ ]` / `- [x]`）に対応。

### 4. マルチユーザー対応
各ユーザーは独立したタスクリストを持ち、他のユーザーのデータにアクセスできない安全な設計。

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

プルリクエストや課題報告を歓迎します。開発に参加される方は、まずissueで議論してください。

---

**生産性を向上させる新しいタスク管理体験をお楽しみください！**