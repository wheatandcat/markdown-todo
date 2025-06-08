#!/bin/bash

# Direct Electron build without rebuilding frontend
echo "🔨 Building Electron macOS app (direct)..."

# Ensure Electron files are compiled
cd electron && npx tsc && cd ..

# Build with inline configuration
npx electron-builder \
  --mac \
  --config.appId=com.smarttask.manager \
  --config.productName="スマートタスク管理" \
  --config.directories.output=dist-electron \
  --config.files='["dist/**/*", "electron/dist/**/*", "node_modules/**/*", "!node_modules/electron/**/*", "!node_modules/electron-builder/**/*"]' \
  --config.extraMetadata.main=electron/dist/main.js \
  --config.extraMetadata.type=undefined \
  --config.mac.category=public.app-category.productivity

echo "✅ Direct build completed"
ls -la dist-electron/ 2>/dev/null || echo "Build directory not found"