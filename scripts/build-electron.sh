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

# Rename .js files to .cjs for CommonJS compatibility
cd electron/dist
for file in *.js; do
  if [[ -f "$file" ]]; then
    mv "$file" "${file%.js}.cjs"
  fi
done
cd ../..

# Build macOS app
echo "🍎 Building macOS app..."
npx electron-builder --mac --config electron.config.cjs

echo "✅ macOS app build complete!"
echo "📁 Output: dist-electron/"