#!/bin/bash

# Test Electron connection to localhost:5001
echo "Testing Electron connection to localhost:5001..."

# Start static server on port 5001 in background
echo "Starting static server on port 5001..."
ELECTRON_PORT=5001 node -e "
const { createStaticServer } = require('./electron/dist/static-server.js');
createStaticServer(5001).then(() => {
  console.log('Static server started on port 5001');
}).catch(err => {
  console.error('Static server failed:', err);
  process.exit(1);
});
" &
SERVER_PID=$!

# Wait for server to start
sleep 3

# Test connection
curl -s http://localhost:5001 > /dev/null
if [ $? -eq 0 ]; then
  echo "✅ Static server responding on port 5001"
else
  echo "❌ Static server not responding"
fi

# Test Electron app briefly
echo "Testing Electron app startup..."
ELECTRON_PORT=5001 timeout 10 npx electron electron/dist/main.js > /tmp/electron.log 2>&1 &
ELECTRON_PID=$!

sleep 5
kill $ELECTRON_PID 2>/dev/null
kill $SERVER_PID 2>/dev/null

# Check logs
if grep -q "Static server successfully started" /tmp/electron.log; then
  echo "✅ Electron static server started successfully"
else
  echo "❌ Electron static server startup failed"
fi

if grep -q "Page loaded successfully" /tmp/electron.log; then
  echo "✅ Page loaded in Electron"
else
  echo "❌ Page failed to load in Electron"
fi

echo "Electron test complete"