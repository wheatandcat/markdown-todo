#!/bin/bash

# Test minimal Electron build
echo "🧪 Testing minimal Electron build..."

# Apply package.json fix
./scripts/fix-build-deps.sh

# Build web app
echo "📦 Building web application..."
npm run build

# Compile Electron files
echo "⚙️ Compiling Electron files..."
cd electron && npx tsc && cd ..

# Test electron-builder with dry run
echo "🔍 Testing electron-builder configuration..."
npx electron-builder --mac --dir --config electron.config.cjs

# Check if build succeeded
if [ -d "dist-electron/mac" ]; then
  echo "✅ Minimal build successful"
  ls -la dist-electron/mac/
else
  echo "❌ Build failed"
fi

# Restore package.json
if [ -f package.json.backup ]; then
  mv package.json.backup package.json
fi
rm -f package.json.tmp