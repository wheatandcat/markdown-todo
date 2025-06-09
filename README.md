<div align="center">

# 🚀 スマートタスク管理

### _Smart Task Manager_

<img src="https://img.shields.io/badge/React-18.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React">
<img src="https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/PostgreSQL-15.0-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
<img src="https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS">

**Markdown で作成したタスクが 1 時間後に自動完了する、生産性を向上させる次世代タスク管理システム**

[🎯 デモを見る](https://cross-platform-todo-wheatandcat.replit.app/) • [📖 ドキュメント](#技術スタック) • [🚀 今すぐ始める](#開発環境セットアップ)

---

</div>

## ✨ 主な機能

### 🔐 デュアル認証システム

- 🌟 **メールアドレス認証**: 独自アカウントでセキュアログイン
- ⚡ **Replit 認証**: ワンクリック簡単ログイン
- 🛡️ **セッション管理**: 安全なユーザーデータ保護

### 📝 Markdown タスク管理

- ✏️ **リアルタイムエディター**: ライブプレビュー機能
- ☑️ **チェックボックス記法**: `- [ ]` / `- [x]` 対応
- 🔄 **一括インポート**: Markdown からタスク自動生成

### ⏰ 自動完了システム

- ⏲️ **1 時間タイマー**: チェック後自動完了
- 📈 **進捗追跡**: リアルタイム状態更新
- 🎯 **集中力向上**: 達成感を促進する仕組み

### 📊 インテリジェント分類

- 🟢 **アクティブタスク**: 進行中タスクの管理
- ✅ **完了タスク**: 達成済みタスクの履歴
- ⏳ **タイマータスク**: カウントダウン中タスク

---

## 🎨 美しい UI/UX

<div align="center">

|   🌙 ダークモード    | 📱 レスポンシブ  |       🎯 日本語対応        |   ⚡ 高速表示    |
| :------------------: | :--------------: | :------------------------: | :--------------: |
| 目に優しい暗色テーマ | モバイル完全対応 | 完全日本語インターフェース | 瞬時ロード・更新 |

</div>

## 🛠️ 技術スタック

<div>

### Frontend Architecture

```mermaid
graph TD
    A[React 18 + TypeScript] --> B[TanStack Query]
    A --> C[wouter Router]
    A --> D[React Hook Form + Zod]
    B --> E[shadcn/ui Components]
    C --> E
    D --> E
    E --> F[Tailwind CSS]
```

</div>

#### 🎨 **Frontend**

- ![React](https://img.shields.io/badge/React-18.0-61DAFB?style=flat-square&logo=react) **React 18** + **TypeScript**
- ![Vite](https://img.shields.io/badge/Vite-4.0-646CFF?style=flat-square&logo=vite) **Vite** - Lightning fast dev server
- ![TanStack](https://img.shields.io/badge/TanStack-Query-FF4154?style=flat-square) **TanStack Query** - Smart data fetching
- ![Wouter](https://img.shields.io/badge/wouter-Router-blue?style=flat-square) **wouter** - Lightweight routing
- ![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css) **Tailwind CSS** + **shadcn/ui**

#### ⚙️ **Backend**

- ![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js) **Node.js** + **Express**
- ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript) **TypeScript** - Type safety
- ![Drizzle](https://img.shields.io/badge/Drizzle-ORM-C5F74F?style=flat-square) **Drizzle ORM** - Type-safe database
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15.x-4169E1?style=flat-square&logo=postgresql) **PostgreSQL** - Robust data storage

#### 🔐 **Authentication**

- ![OpenID](https://img.shields.io/badge/OpenID-Connect-orange?style=flat-square) **Replit Auth** (OpenID Connect)
- ![Passport](https://img.shields.io/badge/Passport.js-Auth-34E27A?style=flat-square) **Passport.js** - Auth middleware
- ![bcrypt](https://img.shields.io/badge/bcryptjs-Hash-red?style=flat-square) **bcryptjs** - Password security
- 🏠 **Local Auth** - Email/password system

## 🗄️ データベース設計

<div>

```mermaid
erDiagram
    Users ||--o{ Tasks : owns
    Users {
        varchar id PK
        varchar email UK
        varchar firstName
        varchar lastName
        varchar profileImageUrl
        varchar authType
        varchar passwordHash
        timestamp createdAt
        timestamp updatedAt
    }
    Tasks {
        serial id PK
        varchar userId FK
        text text
        boolean completed
        bigint checkedAt
        timestamp createdAt
        timestamp updatedAt
    }
    Sessions {
        varchar sid PK
        jsonb sess
        timestamp expire
    }
```

</div>

#### 👥 **Users Table**

```sql
id          VARCHAR    PK
email       VARCHAR    UNIQUE
firstName   VARCHAR
lastName    VARCHAR
authType    VARCHAR    ('replit'|'local')
passwordHash VARCHAR   (for local auth)
createdAt   TIMESTAMP
updatedAt   TIMESTAMP
```

#### ✅ **Tasks Table**

```sql
id         SERIAL     PK
userId     VARCHAR    FK → Users(id)
text       TEXT
completed  BOOLEAN
checkedAt  BIGINT     (Unix timestamp)
createdAt  TIMESTAMP
updatedAt  TIMESTAMP
```

#### 🔐 **Sessions Table**

```sql
sid       VARCHAR    PK
sess      JSONB      (session data)
expire    TIMESTAMP  (auto cleanup)
```

## 🔌 API エンドポイント

### 🔐 **Authentication API**

```http
GET    /api/auth/user        # 現在のユーザー情報
POST   /api/auth/register    # 新規ユーザー登録
POST   /api/auth/local-login # ローカルログイン
GET    /api/login            # Replitログイン開始
GET    /api/logout           # ログアウト
```

### ✅ **Task Management API**

```http
GET    /api/tasks            # 全タスク取得
GET    /api/tasks/active     # アクティブタスク
GET    /api/tasks/completed  # 完了タスク
GET    /api/tasks/timers     # タイマータスク
POST   /api/tasks            # タスク作成
PATCH  /api/tasks/:id        # タスク更新
DELETE /api/tasks/:id        # タスク削除
POST   /api/tasks/markdown   # Markdown一括作成
```

## 🚀 開発環境セットアップ

<div align="center">

### クイックスタート

![Setup](https://img.shields.io/badge/Setup-3_Steps-brightgreen?style=for-the-badge)
![Time](https://img.shields.io/badge/Time-5_Minutes-blue?style=for-the-badge)

</div>

#### 📋 **前提条件**

- ![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=node.js) Node.js 18 以上
- ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=flat&logo=postgresql) PostgreSQL データベース
- ![Git](https://img.shields.io/badge/Git-Latest-F05032?style=flat&logo=git) Git (クローン用)

#### ⚙️ **環境変数設定**

```bash
DATABASE_URL=postgresql://user:pass@localhost:5432/db
SESSION_SECRET=your-session-secret
REPL_ID=your-repl-id
ISSUER_URL=https://replit.com/oidc
REPLIT_DOMAINS=your-domain.replit.app
```

#### 🏃‍♂️ **実行手順**

```bash
# 1️⃣ インストール
npm install

# 2️⃣ データベース初期化
npm run db:push

# 3️⃣ 開発サーバー起動
npm run dev
open http://localhost:3001
```

---

## 🖥️ macOS アプリケーション

このプロジェクトは Electron を使ってネイティブ macOS アプリとしてもビルドできます。

### 📦 **プロダクションビルド**

```bash
# macOSアプリをビルド (.dmg)
sh ./scripts/build-electron.sh
```

### ✨ **ネイティブ機能**

- 🍎 **macOS 統合**: ネイティブメニューバー・ショートカット
- 🌙 **ダークモード**: システム設定に自動対応
- 🔒 **セキュリティ**: コンテキスト分離・権限管理
- 📱 **ウィンドウ管理**: macOS ネイティブな操作感

詳細: [ELECTRON_SETUP.md](ELECTRON_SETUP.md)

## 📁 プロジェクト構成

<div>

```
📁 smart-task-manager/
┣ 📁 client/                    # 🎨 Frontend Application
┃ ┗ 📁 src/
┃   ┣ 📁 components/            # 🧩 React Components
┃   ┣ 📁 hooks/                 # 🪝 Custom Hooks
┃   ┣ 📁 lib/                   # 🛠️ Utilities & Helpers
┃   ┗ 📁 pages/                 # 📄 Page Components
┣ 📁 server/                    # ⚙️ Backend Services
┃ ┣ 📄 index.ts                 # 🚀 Server Entry Point
┃ ┣ 📄 routes.ts                # 🛣️ API Routes
┃ ┣ 📄 storage.ts               # 💾 Data Access Layer
┃ ┣ 📄 db.ts                    # 🗄️ Database Connection
┃ ┗ 📄 replitAuth.ts            # 🔐 Authentication Setup
┣ 📁 shared/                    # 🤝 Shared Resources
┃ ┗ 📄 schema.ts                # 📋 Type Definitions
┣ 📄 package.json               # 📦 Dependencies
┗ 📄 README.md                  # 📖 Documentation
```

</div>

---

## 🌟 主な特徴

<div align="center">

|  🔐 **デュアル認証**   |  ⏰ **自動完了**   |   📝 **Markdown**    | 👥 **マルチユーザー**  |
| :--------------------: | :----------------: | :------------------: | :--------------------: |
| Replit & ローカル認証  |  1 時間後自動完了  | チェックボックス記法 |   独立したデータ管理   |
| 2 つの認証方法から選択 | 集中力維持と達成感 |    使い慣れた記法    | セキュアなユーザー分離 |

</div>

---

## 🤝 コントリビューション

![Contributors](https://img.shields.io/badge/Contributors-Welcome-brightgreen?style=for-the-badge)
![Issues](https://img.shields.io/badge/Issues-Open-blue?style=for-the-badge)
![PRs](https://img.shields.io/badge/PRs-Welcome-orange?style=for-the-badge)

### 貢献方法

1. 🍴 **Fork** このリポジトリ
2. 🌿 **ブランチ作成** (`git checkout -b feature/amazing-feature`)
3. 💾 **コミット** (`git commit -m 'Add amazing feature'`)
4. 📤 **プッシュ** (`git push origin feature/amazing-feature`)
5. 🔀 **プルリクエスト作成**

---

## 📄 ライセンス

<div align="center">

![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

このプロジェクトは **MIT License** の下で公開されています

</div>

---

<div align="center">

## 🎯 **生産性を向上させる新しいタスク管理体験をお楽しみください！**

### Made with ❤️ by developers, for developers

[![Star this repo](https://img.shields.io/badge/⭐-Star_this_repo-yellow?style=for-the-badge)](/)
[![Follow](https://img.shields.io/badge/👀-Follow_for_updates-blue?style=for-the-badge)](/)

---

_🚀 Let's build amazing productivity tools together! 🚀_

</div>
