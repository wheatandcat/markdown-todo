#!/bin/bash

# Development mode for Electron app
echo "🚀 Starting Electron development mode..."

# Check if server is already running on port 3001 (local) or 5000 (Replit)
LOCAL_PORT=3001
REPLIT_PORT=5000

if curl -s http://localhost:$LOCAL_PORT >/dev/null 2>&1; then
  SERVER_PORT=$LOCAL_PORT
  echo "✅ Local server running on port $LOCAL_PORT"
elif curl -s http://localhost:$REPLIT_PORT >/dev/null 2>&1; then
  SERVER_PORT=$REPLIT_PORT
  echo "✅ Replit server running on port $REPLIT_PORT"
else
  SERVER_PORT=$LOCAL_PORT
  echo "🌐 No server running, will start on port $LOCAL_PORT"
fi

if [ "$SERVER_PORT" != "0" ]; then
  
  # Compile Electron TypeScript files
  echo "⚙️ Compiling Electron files..."
  npx tsc --project electron/tsconfig.json
  
  # Rename .js files to .cjs for CommonJS compatibility
  mv electron/dist/main.js electron/dist/main.cjs 2>/dev/null || true
  mv electron/dist/preload.js electron/dist/preload.cjs 2>/dev/null || true
  
  # Start Electron with detected server port
  echo "🖥️ Starting Electron app connecting to port $SERVER_PORT..."
  PORT=$SERVER_PORT electron electron/dist/main.cjs
else
  # No server running, start local server and Electron
  echo "🌐 Starting local server on port $LOCAL_PORT and Electron app..."
  
  # Compile Electron TypeScript files
  echo "⚙️ Compiling Electron files..."
  npx tsc --project electron/tsconfig.json
  
  # Rename .js files to .cjs for CommonJS compatibility
  mv electron/dist/main.js electron/dist/main.cjs 2>/dev/null || true
  mv electron/dist/preload.js electron/dist/preload.cjs 2>/dev/null || true
  
  # Start the web server and Electron concurrently with local port
  npx concurrently \
    "PORT=$LOCAL_PORT NODE_ENV=development tsx server/index.ts" \
    "wait-on http://localhost:$LOCAL_PORT && PORT=$LOCAL_PORT electron electron/dist/main.cjs" \
    --names "web,electron" \
    --prefix-colors "blue,green"
fi