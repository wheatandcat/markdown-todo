#!/bin/bash

# Development mode for Electron app
echo "🚀 Starting Electron development mode..."

# Compile Electron TypeScript files
echo "⚙️ Compiling Electron files..."
npx tsc --project electron/tsconfig.json

# Start the web server and Electron concurrently
echo "🌐 Starting web server and Electron app..."
npx concurrently \
  "npm run dev" \
  "wait-on http://localhost:5000 && electron electron/dist/main.js" \
  --names "web,electron" \
  --prefix-colors "blue,green"