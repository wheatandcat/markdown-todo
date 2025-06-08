#!/bin/bash

# Quick Electron build with white screen fixes
echo "🔨 Building Electron macOS app (quick build)..."

# Clean previous builds
rm -rf dist-electron electron/dist

# Build web application
echo "📦 Building web application..."
npm run build

# Compile Electron files
echo "⚙️ Compiling Electron files..."
cd electron && npx tsc && cd ..

# Build Electron app with minimal configuration
echo "🍎 Building macOS app..."
npx electron-builder --mac --config.appId=com.smarttask.manager --config.productName="スマートタスク管理" --config.directories.output=dist-electron --config.extraMetadata.main=electron/dist/main.js --config.extraMetadata.type=undefined

# Show results
if [ -d "dist-electron" ]; then
  echo "✅ Build completed!"
  find dist-electron -name "*.dmg" -o -name "*.app" | head -3
else
  echo "❌ Build failed"
fi