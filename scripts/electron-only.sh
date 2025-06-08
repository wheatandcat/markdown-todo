#!/bin/bash

# Start Electron app (assumes server is already running)
echo "🖥️ Starting Electron app..."

# Compile Electron TypeScript files
echo "⚙️ Compiling Electron files..."
npx tsc --project electron/tsconfig.json

# Check if server is running
if ! curl -s http://localhost:5000 >/dev/null 2>&1; then
  echo "❌ Server not running on port 5000"
  echo "Please start the server first with: npm run dev"
  exit 1
fi

echo "✅ Server detected, launching Electron app..."
electron electron/dist/main.js