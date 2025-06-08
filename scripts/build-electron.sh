#!/bin/bash

# Build Electron macOS app
echo "🔨 Building Electron macOS app..."

# Clean previous builds
rm -rf dist-electron
rm -rf electron/dist

# Build web app
echo "📦 Building web application..."
npm run build

# Compile Electron TypeScript files
echo "⚙️ Compiling Electron files..."
npx tsc --project electron/tsconfig.json

# Build macOS app
echo "🍎 Building macOS app..."
npx electron-builder --mac --config electron.config.js

echo "✅ macOS app build complete!"
echo "📁 Output: dist-electron/"