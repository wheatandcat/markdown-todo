#!/bin/bash

# Tauri build script for macOS app
echo "🦀 Building Tauri macOS app..."

# Environment setup
export NODE_OPTIONS="--max-old-space-size=4096"
export RUST_BACKTRACE=1

# Clean previous builds
rm -rf src-tauri/target/release

# Build web application first
echo "📦 Building web application..."
npm run build || {
  echo "❌ Web build failed"
  exit 1
}

# Build Tauri app
echo "🍎 Building macOS app with Tauri..."
npm run tauri:build

# Show results
if [ -d "src-tauri/target/release/bundle" ]; then
  echo "✅ Build completed successfully!"
  echo "📁 Generated files:"
  find src-tauri/target/release/bundle -name "*.dmg" -o -name "*.app" | while read file; do
    echo "  $(basename "$file")"
  done
  echo "📁 Build output: src-tauri/target/release/bundle/"
else
  echo "❌ Build failed"
  exit 1
fi