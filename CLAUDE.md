# CLAUDE.md

必ず日本語で回答してください。

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Smart Task Manager - a Japanese TODO application with Markdown support and cross-platform capabilities. The architecture follows a monorepo structure with three main layers:

- **Frontend (React SPA)**: `/client/` - React 18 + TypeScript web application
- **Backend (Express API)**: `/server/` - Node.js Express server with PostgreSQL
- **Desktop App (Electron)**: `/electron/` - Native macOS application wrapper

## Development Commands

### Core Development

```bash
# Start development server (port 3001)
npm run dev

# Build for production
npm run build

# Database operations
npm run db:push        # Push schema changes
npm run db:generate    # Generate migrations
```

### Electron Development

```bash
# Build Electron app (creates .dmg for macOS)
./scripts/build-electron.sh

# For development, ensure server is running on port 5000
```

### Testing & Quality

```bash
# Check for available lint/test commands
npm run --silent 2>/dev/null | grep -E "^\s*(lint|test|typecheck)"
```

## Architecture & Key Technologies

### Frontend Stack

- **React 18** + **TypeScript** with **Vite** build system
- **TanStack Query** for data fetching and state management
- **wouter** for lightweight routing
- **Tailwind CSS** + **shadcn/ui** components
- **React Hook Form** + **Zod** for form validation
- **Next Themes** for dark/light mode

### Backend Stack

- **Express** + **TypeScript** server
- **Drizzle ORM** with **PostgreSQL** (Neon serverless)
- **Passport.js** authentication (supports Replit OAuth + local auth)
- **bcryptjs** for password hashing

### Configuration Files

- `vite.config.ts` - Vite setup with path aliases (`@` → client/src, `@shared` → shared)
- `drizzle.config.ts` - Database ORM configuration
- `electron.config.cjs` - Electron Builder for macOS packaging
- `shared/schema.ts` - Database schema shared between client/server

## Port Strategy

- **Development**: 3001 (web dev server)
- **Production**: 5002 (production server)
- **Electron**: 5001 (embedded server)

## Database Schema

Core tables in `shared/schema.ts`:

- **Users**: Supports both Replit and local authentication
- **Tasks**: Todo functionality with timer support (auto-complete after 1 hour)
- **Sessions**: Required for Replit Auth integration

## Build Process Notes

### Electron Build

The `scripts/build-electron.sh` script handles complex Electron packaging:

1. Builds web application with timeout protection
2. Compiles Electron TypeScript files
3. Creates temporary package.json (removes ES modules for Electron compatibility)
4. Generates macOS .dmg installer for both x64 and arm64
5. Restores original package.json after build

### Memory Optimization

Build processes use `--max-old-space-size=4096` for memory-intensive operations.

## Special Features

- **Auto-Complete**: Tasks automatically complete after 1 hour when checked
- **Markdown Integration**: Full Markdown support with checkbox notation (`- [ ]` / `- [x]`)
- **Dual Authentication**: Replit OAuth and traditional email/password
- **Japanese Localization**: Complete Japanese interface

## Development vs Production

- **Development**: Requires external server on port 5000
- **Production**: Uses embedded static server or packaged backend
- **Electron**: Sophisticated server detection with fallback strategies
