#!/bin/bash

# Test white screen fix quickly
echo "Testing white screen fix..."

# Check if build files exist
if [ ! -f "dist/public/index.html" ]; then
  echo "Building frontend first..."
  npm run build > /dev/null 2>&1 || {
    echo "Frontend build failed, but continuing with existing files"
  }
fi

# Check compiled Electron files
if [ ! -f "electron/dist/main.js" ]; then
  echo "Compiling Electron files..."
  cd electron && npx tsc && cd ..
fi

# Verify fixes are in place
echo "Checking white screen fixes:"

# Check port fix
if grep -q "ELECTRON_PORT.*5001" electron/dist/main.js; then
  echo "✅ Port conflict fix applied (Electron uses 5001)"
else
  echo "❌ Port fix not found"
fi

# Check error handling
if grep -q "unhandledrejection" dist/public/assets/*.js 2>/dev/null; then
  echo "✅ Unhandled rejection fix applied"
else
  echo "❌ Error handling fix not found"
fi

# Check static server
if [ -f "electron/dist/static-server.js" ]; then
  echo "✅ Static file server available"
else
  echo "❌ Static server missing"
fi

echo "White screen fix verification complete"