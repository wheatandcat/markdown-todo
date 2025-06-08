#!/bin/bash

# Local development script to avoid port conflicts
echo "🚀 Starting local development server on port 3001..."

# Set environment variables for local development
export NODE_ENV=development
export PORT=3001

# Start the development server
tsx server/index.ts