#!/bin/bash

# Simple Electron build without package.json modifications
echo "🔨 Building Electron macOS app (simple approach)..."

# Environment setup
export NODE_OPTIONS="--max-old-space-size=4096"
export CSC_IDENTITY_AUTO_DISCOVERY=false

# Clean previous builds
rm -rf dist-electron electron/dist

# Build web application
echo "📦 Building web application..."
npm run build

# Compile Electron TypeScript files
echo "⚙️ Compiling Electron files..."
cd electron && npx tsc && cd ..

# Create a minimal package.json for Electron app only
echo "📄 Creating Electron app package.json..."
cat > app-package.json << 'EOF'
{
  "name": "smart-task-manager",
  "version": "1.0.0",
  "main": "electron/dist/main.js"
}
EOF

# Build with simplified configuration
echo "🍎 Building macOS app..."
npx electron-builder --mac --config electron.config.cjs --extraMetadata.main="electron/dist/main.js"

# Cleanup
rm -f app-package.json

# Show results
if [ -d "dist-electron" ]; then
  echo "✅ Build completed!"
  echo "📁 Generated files:"
  find dist-electron -name "*.dmg" -o -name "*.app" | head -3
else
  echo "❌ Build failed"
fi