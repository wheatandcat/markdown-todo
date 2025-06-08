const http = require('http');

async function checkServerConnection(port = 5000) {
  return new Promise((resolve) => {
    console.log(`Testing connection to localhost:${port}...`);
    
    const req = http.get(`http://localhost:${port}/api/auth/user`, (res) => {
      console.log(`✅ Server responded with status: ${res.statusCode}`);
      resolve(true);
    });
    
    req.on('error', (err) => {
      console.log(`❌ Connection failed: ${err.message}`);
      resolve(false);
    });
    
    req.setTimeout(2000, () => {
      console.log('❌ Connection timeout');
      req.destroy();
      resolve(false);
    });
  });
}

// Test the connection
checkServerConnection().then(connected => {
  console.log(`Connection result: ${connected}`);
  process.exit(0);
});