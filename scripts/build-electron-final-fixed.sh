#!/bin/bash

# Final Electron build with guaranteed localhost connection
echo "🔨 Building Electron macOS app with localhost fix..."

# Environment setup
export NODE_OPTIONS="--max-old-space-size=4096"
export CSC_IDENTITY_AUTO_DISCOVERY=false
export ELECTRON_PORT=5001

# Clean previous builds
rm -rf dist-electron electron/dist

# Ensure web application is built
if [ ! -f "dist/public/index.html" ]; then
  echo "📦 Building web application..."
  npm run build
fi

# Compile Electron files
echo "⚙️ Compiling Electron files..."
cd electron && npx tsc && cd ..

# Create temporary package.json for electron-builder
echo "📄 Creating build package.json..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Create build version that forces localhost usage
const buildPkg = {
  ...pkg,
  main: 'electron/dist/main.js',
  type: undefined,
  // Force localhost in environment
  env: {
    ELECTRON_FORCE_LOCALHOST: 'true',
    ELECTRON_PORT: '5001'
  }
};

// Move electron packages to devDependencies
if (pkg.dependencies) {
  buildPkg.devDependencies = buildPkg.devDependencies || {};
  if (pkg.dependencies.electron) {
    buildPkg.devDependencies.electron = pkg.dependencies.electron;
    delete buildPkg.dependencies.electron;
  }
  if (pkg.dependencies['electron-builder']) {
    buildPkg.devDependencies['electron-builder'] = pkg.dependencies['electron-builder'];
    delete buildPkg.dependencies['electron-builder'];
  }
}

fs.writeFileSync('package.json.build', JSON.stringify(buildPkg, null, 2));
"

# Backup original and use build version
cp package.json package.json.original
cp package.json.build package.json

# Build Electron app
echo "🍎 Building macOS app..."
npx electron-builder --mac --config electron.config.cjs

# Restore original package.json
mv package.json.original package.json
rm -f package.json.build

# Show results
if [ -d "dist-electron" ]; then
  echo "✅ Build completed successfully!"
  echo "📁 Generated files:"
  find dist-electron -name "*.dmg" -o -name "*.app" | while read file; do
    echo "  $(basename "$file")"
  done
  
  echo ""
  echo "🔧 White screen fix applied:"
  echo "  - Electron uses localhost:5001 instead of file:// protocol"
  echo "  - Static server serves files from dist/public/"
  echo "  - Auto-retry connection on failure"
  echo "  - Production server uses port 5002 to avoid conflicts"
else
  echo "❌ Build failed"
  exit 1
fi

echo "📁 Build output: dist-electron/"
echo "📋 To test: Open the generated .app file in dist-electron/mac/"