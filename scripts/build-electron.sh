#!/bin/bash

# Build Electron macOS app
echo "🔨 Building Electron macOS app..."

# Set environment variables to avoid build issues
export NODE_OPTIONS="--max-old-space-size=4096"
export CSC_IDENTITY_AUTO_DISCOVERY=false

# Clean previous builds
rm -rf dist-electron
rm -rf electron/dist
rm -rf dist

# Fix package.json dependencies
echo "🔧 Fixing package.json dependencies..."
chmod +x scripts/fix-build-deps.sh
./scripts/fix-build-deps.sh

# Build web app with error handling
echo "📦 Building web application..."
if ! npm run build; then
  echo "❌ Web app build failed"
  # Restore package.json and exit
  if [ -f package.json.backup ]; then
    mv package.json.backup package.json
  fi
  rm -f package.json.tmp
  exit 1
fi

# Compile Electron TypeScript files
echo "⚙️ Compiling Electron files..."
if ! npx tsc --project electron/tsconfig.json; then
  echo "❌ Electron compilation failed"
  # Restore package.json and exit
  if [ -f package.json.backup ]; then
    mv package.json.backup package.json
  fi
  rm -f package.json.tmp
  exit 1
fi

# Build macOS app with proper error handling
echo "🍎 Building macOS app..."
if npx electron-builder --mac --config electron.config.cjs; then
  echo "✅ macOS app build complete!"
  
  # Show generated files
  if [ -d "dist-electron" ]; then
    echo ""
    echo "📁 Generated files:"
    find dist-electron -name "*.dmg" -o -name "*.zip" -o -name "*.app" | while read file; do
      echo "  $(basename "$file") ($(du -h "$file" | cut -f1))"
    done
  fi
else
  echo "❌ Electron Builder failed"
fi

# Restore original package.json
echo "🔄 Restoring package.json..."
if [ -f package.json.backup ]; then
  mv package.json.backup package.json
fi
rm -f package.json.tmp

echo "📁 Build output directory: dist-electron/"