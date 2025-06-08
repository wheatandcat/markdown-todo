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
npx electron-builder --mac --config electron.config.cjs

echo "✅ macOS app build complete!"
echo "📁 Output: dist-electron/"
echo ""
echo "Generated files:"
ls -la dist-electron/ | grep -E '\.(dmg|zip|app)' || echo "No app files found yet - check for errors above"