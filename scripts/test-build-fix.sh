#!/bin/bash

# Test the electron builder dependency fix
echo "🧪 Testing Electron Builder configuration..."

# Apply the fix
./scripts/fix-build-deps.sh

# Test electron-builder configuration parsing
echo "📋 Testing electron-builder config..."
npx electron-builder --help > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Electron Builder available"
else
  echo "❌ Electron Builder not available"
  exit 1
fi

# Test configuration file parsing
echo "📄 Testing config file..."
node -e "
try {
  const config = require('./electron.config.cjs');
  console.log('✅ Config file loads correctly');
  console.log('📦 App ID:', config.appId);
  console.log('📦 Product Name:', config.productName);
} catch (e) {
  console.error('❌ Config file error:', e.message);
  process.exit(1);
}
"

# Restore original package.json
if [ -f package.json.backup ]; then
  mv package.json.backup package.json
fi
rm -f package.json.tmp

echo "✅ Build configuration test complete"