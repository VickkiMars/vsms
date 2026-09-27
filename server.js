import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_DIR = path.resolve(__dirname, 'dist');

// Read port from environment variable as required by Vercel; default to 80
const PORT = parseInt(process.env.PORT || '80', 10);
const HOST = process.env.HOST || '0.0.0.0';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.wasm': 'application/wasm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

const server = http.createServer((req, res) => {
  // Normalize request URL
  const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  let pathname = decodeURIComponent(parsedUrl.pathname);

  // Handle health check endpoints for container probes
  if (pathname === '/health' || pathname === '/ping' || pathname === '/api/health') {
    res.writeHead(200, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'vsms-container',
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }));
    return;
  }

  // Handle Vercel /api rewrite prefix if vercel.json rewrites /(.*) to /api
  if (pathname === '/api' || pathname === '/api/') {
    pathname = '/';
  } else if (pathname.startsWith('/api/')) {
    pathname = pathname.slice(4);
  }

  // Prevent directory traversal attacks
  const safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  let targetPath = path.join(DIST_DIR, safePath);

  // If path is a directory, check for index.html inside
  if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
    targetPath = path.join(targetPath, 'index.html');
  }

  // SPA fallback: If requested file does not exist, serve dist/index.html
  if (!fs.existsSync(targetPath)) {
    targetPath = path.join(DIST_DIR, 'index.html');
  }

  // If dist output not found
  if (!fs.existsSync(targetPath)) {
    res.writeHead(503, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('503 Service Unavailable: Application build output (dist) not found. Run npm run build first.');
    return;
  }

  // Serve the file
  fs.stat(targetPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 Not Found');
      return;
    }

    const ext = path.extname(targetPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const headers = {
      'Content-Type': contentType,
      'Content-Length': stats.size,
    };

    // Long-term immutable caching for hashed assets, no-cache for index.html
    if (targetPath.includes('/assets/') || targetPath.includes('\\assets\\')) {
      headers['Cache-Control'] = 'public, max-age=31536000, immutable';
    } else {
      headers['Cache-Control'] = 'no-cache, no-store, must-revalidate';
    }

    res.writeHead(200, headers);

    const stream = fs.createReadStream(targetPath);
    stream.on('error', () => {
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('500 Internal Server Error');
      }
    });
    stream.pipe(res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`[VSMS Vercel Container] Server listening on ${HOST}:${PORT}`);
  console.log(`[VSMS Vercel Container] Serving static dist from: ${DIST_DIR}`);
});

// Vercel serverless graceful shutdown (SIGTERM signal gives a 30s grace window)
const handleGracefulShutdown = (signal) => {
  console.log(`[VSMS Vercel Container] Received ${signal}. Closing server gracefully...`);
  server.close(() => {
    console.log('[VSMS Vercel Container] Server closed cleanly.');
    process.exit(0);
  });

  // Force shutdown after 10s if connections do not drain
  setTimeout(() => {
    console.error('[VSMS Vercel Container] Forced termination after timeout.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
