#!/bin/bash

# Start Electron app (assumes server is already running)
echo "🖥️ Starting Electron app..."

# Compile Electron TypeScript files
echo "⚙️ Compiling Electron files..."
npx tsc --project electron/tsconfig.json

# Rename .js files to .cjs for CommonJS compatibility
mv electron/dist/main.js electron/dist/main.cjs 2>/dev/null || true
mv electron/dist/preload.js electron/dist/preload.cjs 2>/dev/null || true

# Check if server is running
if ! curl -s http://localhost:5000 >/dev/null 2>&1; then
  echo "❌ Server not running on port 5000"
  echo "Please start the server first with: npm run dev"
  exit 1
fi

echo "✅ Server detected, launching Electron app..."
electron electron/dist/main.cjs