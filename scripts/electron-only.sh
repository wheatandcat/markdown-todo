#!/bin/bash

# Start Electron app (assumes server is already running)
echo "🖥️ Starting Electron app..."

# Compile Electron TypeScript files
echo "⚙️ Compiling Electron files..."
npx tsc --project electron/tsconfig.json

# Rename .js files to .cjs for CommonJS compatibility
mv electron/dist/main.js electron/dist/main.cjs 2>/dev/null || true
mv electron/dist/preload.js electron/dist/preload.cjs 2>/dev/null || true

# Check for server on both ports
LOCAL_PORT=3001
REPLIT_PORT=5000

if curl -s http://localhost:$LOCAL_PORT >/dev/null 2>&1; then
  SERVER_PORT=$LOCAL_PORT
  echo "✅ Local server detected on port $LOCAL_PORT"
elif curl -s http://localhost:$REPLIT_PORT >/dev/null 2>&1; then
  SERVER_PORT=$REPLIT_PORT
  echo "✅ Replit server detected on port $REPLIT_PORT"
else
  echo "❌ No server running on port $LOCAL_PORT or $REPLIT_PORT"
  echo "Please start a server first:"
  echo "  Local: ./scripts/dev-local.sh"
  echo "  Replit: npm run dev"
  exit 1
fi

echo "🖥️ Launching Electron app connecting to port $SERVER_PORT..."
PORT=$SERVER_PORT electron electron/dist/main.cjs