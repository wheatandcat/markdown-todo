#!/bin/bash

# Fix Electron Builder dependencies issue
echo "🔧 Fixing package.json for Electron build..."

# Create a backup
cp package.json package.json.backup

# Create a temporary package.json with correct metadata and dependencies
cat > package.json.tmp << 'EOF'
{
  "name": "smart-task-manager",
  "version": "1.0.0",
  "description": "A sophisticated Japanese TODO application with Markdown support and cross-platform capabilities",
  "author": "Task Manager Team",
  "main": "electron/dist/main.js",
  "homepage": "./",
  "license": "MIT",
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js",
    "check": "tsc",
    "db:push": "drizzle-kit push"
  }
}
EOF

# Extract dependencies from original package.json (excluding electron packages)
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json.backup', 'utf8'));
const tmpPkg = JSON.parse(fs.readFileSync('package.json.tmp', 'utf8'));

// Copy dependencies excluding electron packages
const deps = {};
const devDeps = {};

Object.keys(pkg.dependencies || {}).forEach(dep => {
  if (dep === 'electron' || dep === 'electron-builder') {
    devDeps[dep] = pkg.dependencies[dep];
  } else {
    deps[dep] = pkg.dependencies[dep];
  }
});

// Copy all existing devDependencies
Object.assign(devDeps, pkg.devDependencies || {});

tmpPkg.dependencies = deps;
tmpPkg.devDependencies = devDeps;
tmpPkg.optionalDependencies = pkg.optionalDependencies || {};

fs.writeFileSync('package.json', JSON.stringify(tmpPkg, null, 2));
"

echo "✅ Package.json fixed for build"