#!/bin/bash

# Build Electron macOS app
echo "🔨 Building Electron macOS app..."

# Clean previous builds
rm -rf dist-electron
rm -rf electron/dist

# Fix package.json dependencies
echo "🔧 Fixing package.json dependencies..."
chmod +x scripts/fix-build-deps.sh
./scripts/fix-build-deps.sh

# Build web app
echo "📦 Building web application..."
npm run build

# Compile Electron TypeScript files
echo "⚙️ Compiling Electron files..."
npx tsc --project electron/tsconfig.json

# Build macOS app
echo "🍎 Building macOS app..."
npx electron-builder --mac --config electron.config.cjs

# Restore original package.json
echo "🔄 Restoring package.json..."
if [ -f package.json.backup ]; then
  mv package.json.backup package.json
fi
rm -f package.json.tmp

echo "✅ macOS app build complete!"
echo "📁 Output: dist-electron/"
echo ""
echo "Generated files:"
if [ -d "dist-electron" ]; then
  ls -la dist-electron/ | grep -E '\.(dmg|zip|app)' || echo "Build may have failed - check errors above"
else
  echo "dist-electron directory not created - build failed"
fi