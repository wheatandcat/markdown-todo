#!/bin/bash

# Development mode for Electron app
echo "🚀 Starting Electron development mode..."

# Check if server is already running
if curl -s http://localhost:5000 >/dev/null 2>&1; then
  echo "✅ Server already running on port 5000"
  
  # Compile Electron TypeScript files
  echo "⚙️ Compiling Electron files..."
  npx tsc --project electron/tsconfig.json
  
  # Start Electron only
  echo "🖥️ Starting Electron app..."
  electron electron/dist/main.js
else
  # Server not running, start both
  echo "🌐 Server not running, starting web server and Electron app..."
  
  # Compile Electron TypeScript files
  echo "⚙️ Compiling Electron files..."
  npx tsc --project electron/tsconfig.json
  
  # Start the web server and Electron concurrently
  npx concurrently \
    "npm run dev" \
    "wait-on http://localhost:5000 && electron electron/dist/main.js" \
    --names "web,electron" \
    --prefix-colors "blue,green"
fi