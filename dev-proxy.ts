/**
 * Unified Dev Server — Single entry point for BexieMart development.
 *
 * Architecture:
 *   Proxy (port 8081)
 *   ├─ /api/*  →  Backend (port 3000)
 *   └─ /*      →  Metro Bundler (port 8082)
 *
 * Run with: npm run dev
 */
import { createServer, IncomingMessage, ServerResponse } from 'http';
import type { Socket } from 'net';
import { createProxyMiddleware, responseInterceptor } from 'http-proxy-middleware';

const PROXY_PORT = 8081;
const BACKEND_PORT = 3000;
const METRO_PORT = 8082;

// Proxy to Backend API (handles all /api/* routes)
const apiProxy = createProxyMiddleware({
  target: `http://localhost:${BACKEND_PORT}`,
  changeOrigin: true,
  selfHandleResponse: true,
  on: {
    proxyReq: (proxyReq, _req) => {
      // Rewrite origin to match backend's expected origin
      proxyReq.setHeader('origin', `http://localhost:${BACKEND_PORT}`);
      proxyReq.setHeader('host', `localhost:${BACKEND_PORT}`);
      proxyReq.removeHeader('referer');
    },
    proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req) => {
      // Inject CORS headers into every response
      proxyRes.headers['access-control-allow-origin'] = req.headers.origin || '*';
      proxyRes.headers['access-control-allow-credentials'] = 'true';
      proxyRes.headers['access-control-allow-methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
      proxyRes.headers['access-control-allow-headers'] = 'Content-Type, Authorization, Cookie, Set-Cookie, x-request-id';
      return responseBuffer;
    }),
    error: (err: Error, req: IncomingMessage, res: ServerResponse | Socket) => {
      console.error(`[API] Error proxying request: ${err.message}`);
      if ('writableEnded' in res && !res.writableEnded && 'writeHead' in res) {
        (res as ServerResponse).writeHead(502, { 'Content-Type': 'application/json' });
        (res as ServerResponse).end(JSON.stringify({
          error: 'Backend unavailable',
          message: 'Make sure the backend is running: npm run server',
        }));
      }
    },
  },
  logger: console,
});

// Proxy to Metro Bundler (handles React Native bundling, HMR, dev tools)
const metroProxy = createProxyMiddleware({
  target: `http://localhost:${METRO_PORT}`,
  changeOrigin: true,
  on: {
    error: (err: Error, _req: IncomingMessage, _res: ServerResponse | Socket) => {
      console.error(`[Metro] Error proxying request: ${err.message}`);
    },
  },
});

// WebSocket proxy for Metro HMR
const wsProxy = createProxyMiddleware({
  target: `http://localhost:${METRO_PORT}`,
  ws: true,
  changeOrigin: true,
});

const server = createServer((req, res) => {
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': req.headers.origin || '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, Set-Cookie, x-request-id',
    });
    res.end();
    return;
  }

  // Route /api/* to backend, everything else to Metro
  if (req.url?.startsWith('/api/')) {
    apiProxy(req, res);
  } else {
    metroProxy(req, res);
  }
});

// Handle WebSocket upgrades for Metro HMR
server.on('upgrade', (req, socket, head) => {
  wsProxy.upgrade(req, socket as Socket, head);
});

server.listen(PROXY_PORT, () => {
  console.log('\n═══════════════════════════════════════════');
  console.log('  🚀 BexieMart Unified Dev Server');
  console.log('═══════════════════════════════════════════\n');
  console.log(`  📱 App:          http://localhost:${PROXY_PORT}`);
  console.log(`  🔧 Metro:        http://localhost:${METRO_PORT}`);
  console.log(`  ⚙️  Backend:      http://localhost:${BACKEND_PORT}`);
  console.log(`  🔀 Proxy:        localhost:${PROXY_PORT} → ${METRO_PORT} / ${BACKEND_PORT}`);
  console.log('\n  API requests to /api/* are proxied to backend');
  console.log('  All other requests proxied to Metro bundler');
  console.log('  WebSocket connections proxied to Metro for HMR');
  console.log('═══════════════════════════════════════════\n');
});

// Handle shutdown gracefully
process.on('SIGINT', () => {
  console.log('\n\n  ⏹️  Shutting down unified dev server...');
  server.close(() => process.exit(0));
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
