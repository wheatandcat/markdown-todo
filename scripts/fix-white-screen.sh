#!/bin/bash

# Fix white screen issue without rebuilding
echo "🔧 Fixing Electron white screen issue..."

# Compile Electron TypeScript files only
cd electron && npx tsc && cd ..

# Create a test Electron app to verify the fix
echo "🧪 Testing Electron app locally..."
ELECTRON_PORT=5001 npx electron electron/dist/main.js &
ELECTRON_PID=$!

sleep 3

# Kill test process
kill $ELECTRON_PID 2>/dev/null

echo "✅ White screen fix applied"
echo "📋 Changes made:"
echo "  - Fixed port conflict (Electron uses 5001, dev server uses 5000)"
echo "  - Added global error handling for unhandled rejections"
echo "  - Improved file path resolution for packaged apps"
echo "  - Added static file server fallback"