#!/bin/bash

# Final Electron build solution
echo "🔨 Building Electron macOS app..."

# Environment setup
export NODE_OPTIONS="--max-old-space-size=4096"
export CSC_IDENTITY_AUTO_DISCOVERY=false

# Clean previous builds
rm -rf dist-electron electron/dist

# Build web application (keep original package.json)
echo "📦 Building web application..."
npm run build

# Compile Electron files
echo "⚙️ Compiling Electron files..."
cd electron && npx tsc && cd ..

# Create temporary package.json for electron-builder that removes ES module type
echo "📄 Creating build package.json..."
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

// Create build version without ES module type
const buildPkg = {
  ...pkg,
  main: 'electron/dist/main.js',
  type: undefined  // Remove ES module type for Electron
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
mv package.json package.json.original
mv package.json.build package.json

# Build Electron app
echo "🍎 Building macOS app..."
npx electron-builder --mac --config electron.config.cjs

# Restore original package.json
mv package.json package.json.build
mv package.json.original package.json

# Show results
if [ -d "dist-electron" ]; then
  echo "✅ Build completed successfully!"
  echo "📁 Generated files:"
  find dist-electron -name "*.dmg" -o -name "*.app" | while read file; do
    echo "  $(basename "$file")"
  done
else
  echo "❌ Build failed"
  exit 1
fi

echo "📁 Build output: dist-electron/"