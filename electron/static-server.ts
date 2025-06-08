import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { app } from 'electron';

const mimeTypes: { [key: string]: string } = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

export function createStaticServer(port: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      const url = req.url || '/';
      
      // Determine static file root
      let staticRoot = '';
      const possibleRoots = [
        join(process.resourcesPath, 'dist', 'public'),
        join(process.resourcesPath, 'app', 'dist', 'public'),
        join(__dirname, '..', 'dist', 'public'),
        join(process.cwd(), 'dist', 'public')
      ];
      
      for (const root of possibleRoots) {
        if (existsSync(root)) {
          staticRoot = root;
          break;
        }
      }
      
      if (!staticRoot) {
        res.writeHead(404);
        res.end('Static files not found');
        return;
      }
      
      // Parse requested file path
      let filePath = url === '/' ? '/index.html' : url;
      const fullPath = join(staticRoot, filePath);
      
      // Security check - prevent directory traversal
      if (!fullPath.startsWith(staticRoot)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
      }
      
      // Check if file exists
      if (!existsSync(fullPath)) {
        // For SPA routing, serve index.html for non-asset requests
        if (!url.includes('.') && !url.startsWith('/api/')) {
          const indexPath = join(staticRoot, 'index.html');
          if (existsSync(indexPath)) {
            const content = readFileSync(indexPath);
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(content);
            return;
          }
        }
        
        res.writeHead(404);
        res.end('File not found');
        return;
      }
      
      // Get file extension and mime type
      const ext = extname(fullPath);
      const mimeType = mimeTypes[ext] || 'application/octet-stream';
      
      try {
        const content = readFileSync(fullPath);
        res.writeHead(200, { 
          'Content-Type': mimeType,
          'Cache-Control': 'public, max-age=31536000'
        });
        res.end(content);
      } catch (error) {
        res.writeHead(500);
        res.end('Internal Server Error');
      }
    });
    
    server.listen(port, 'localhost', () => {
      console.log(`Static server running on port ${port}`);
      resolve();
    });
    
    server.on('error', (error) => {
      console.error('Static server error:', error);
      reject(error);
    });
  });
}