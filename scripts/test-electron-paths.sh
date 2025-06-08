#!/bin/bash

# Test Electron build structure and paths
echo "🔍 Testing Electron build paths..."

# Clean and build
rm -rf dist-electron electron/dist
npm run build
cd electron && npx tsc && cd ..

# Check build output structure
echo "📁 Build output structure:"
echo "dist/ contents:"
ls -la dist/ || echo "No dist folder"

echo "dist/public/ contents:"
ls -la dist/public/ || echo "No dist/public folder"

echo "electron/dist/ contents:"
ls -la electron/dist/ || echo "No electron/dist folder"

# Test file paths that Electron will try to access
echo "🔎 Testing file existence:"
test -f "dist/public/index.html" && echo "✅ dist/public/index.html exists" || echo "❌ dist/public/index.html missing"
test -f "electron/dist/main.js" && echo "✅ electron/dist/main.js exists" || echo "❌ electron/dist/main.js missing"
test -f "electron/dist/preload.js" && echo "✅ electron/dist/preload.js exists" || echo "❌ electron/dist/preload.js missing"
test -f "electron/dist/static-server.js" && echo "✅ electron/dist/static-server.js exists" || echo "❌ electron/dist/static-server.js missing"

echo "🏁 Path testing complete"