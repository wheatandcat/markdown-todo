#!/bin/bash

# Complete rebuild with ES module fix
echo "🔨 Building Electron macOS app (ES module fix)..."

# Environment setup
export NODE_OPTIONS="--max-old-space-size=4096"
export CSC_IDENTITY_AUTO_DISCOVERY=false

# Clean everything
rm -rf dist-electron dist electron/dist

# Build web application first (before any package.json changes)
echo "📦 Building web application..."
npm run build

# Apply package.json fix only for electron-builder
./scripts/fix-build-deps.sh

# Compile Electron files as CommonJS
echo "⚙️ Compiling Electron files..."
cd electron && npx tsc && cd ..

# Create a production package.json for the app
echo "📄 Creating production package.json..."
cat > package.json.electron << 'EOF'
{
  "name": "smart-task-manager",
  "version": "1.0.0",
  "description": "A sophisticated Japanese TODO application",
  "main": "electron/dist/main.js",
  "author": "Task Manager Team",
  "license": "MIT"
}
EOF

# Replace the package.json temporarily for build
mv package.json package.json.build-backup
mv package.json.electron package.json

# Build the Electron app
echo "🍎 Building macOS app with fixed configuration..."
npx electron-builder --mac --config electron.config.cjs

# Restore original package.json
mv package.json package.json.electron
mv package.json.build-backup package.json

# Restore from backup
if [ -f package.json.backup ]; then
  mv package.json.backup package.json
fi
rm -f package.json.tmp package.json.electron

# Show results
if [ -d "dist-electron" ]; then
  echo "✅ Build completed successfully!"
  echo "📁 Generated files:"
  find dist-electron -name "*.dmg" -o -name "*.app" | head -5
else
  echo "❌ Build failed"
  exit 1
fi