/**
 * BexieMart Backend Server — H3-based API server with Better Auth + PostgreSQL.
 *
 * Run with: npm run server
 * Dev URL: http://localhost:3000
 *
 * Social Auth: Google, Apple (configured via env vars)
 * Database: Neon PostgreSQL
 */
import { createApp, createRouter, eventHandler } from 'h3';
import { toNodeHandler } from 'h3/node';
import { toNodeHandler as authToNodeHandler } from 'better-auth/node';
import { createServer } from 'node:http';
import { auth, initAuth, pool } from './auth';
import { ALLOWED_ORIGINS, CORS_HEADERS } from './cors';
import { uploadSingle, uploadMultiple, deleteImage, generateSignature } from './routes/upload';
import {
  getProducts, getProductById, createProduct, updateProduct, deleteProduct,
  getCategories, createCategory,
  getWishlist, addToWishlist, removeFromWishlist,
} from './routes/products';
import { initializePayment, verifyPayment, paymentWebhook, getPaymentHistory } from './routes/payments';
import { createOrder, getOrderById, updateOrderStatus, getUserOrders } from './routes/orders';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from './routes/cart';
import { getVendorProfile, updateVendorProfile, getVendorDashboard } from './routes/vendor';

// ─── H3 App ─────────────────────────────────────────────────────────────────────

const app = createApp();
const router = createRouter();

// ─── CORS Middleware ─────────────────────────────────────────────────────────────

const corsMiddleware = eventHandler((event) => {
  const requestOrigin = event.headers.get('origin');

  if (requestOrigin && (ALLOWED_ORIGINS.includes(requestOrigin) || requestOrigin.startsWith('http://localhost'))) {
    event.node!.res!.setHeader('Access-Control-Allow-Origin', requestOrigin);
    Object.entries(CORS_HEADERS).forEach(([key, value]) => {
      event.node!.res!.setHeader(key, value);
    });
  }

  if (event.node!.req!.method === 'OPTIONS') {
    event.node!.res!.statusCode = 204;
    event.node!.res!.end();
    return;
  }
});

// Apply CORS to all routes
app.use(corsMiddleware);

// Auth routes are mounted directly on the HTTP server (see below)
// to avoid H3 body-consumption conflicts with Better Auth's internal parsing.

// ─── API Routes ──────────────────────────────────────────────────────────────────

// Health check
router.get('/api/health', eventHandler(() => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  database: 'PostgreSQL (Neon)',
  auth: ['email', 'google', 'apple'],
})));

// Image upload
router.post('/api/upload', uploadSingle);
router.post('/api/upload/multiple', uploadMultiple);
router.post('/api/upload/signature', generateSignature);
router.delete('/api/upload/:publicId', deleteImage);

// Products
router.get('/api/products', getProducts);
router.get('/api/products/:id', getProductById);
router.post('/api/products', createProduct);
router.put('/api/products/:id', updateProduct);
router.delete('/api/products/:id', deleteProduct);

// Categories
router.get('/api/categories', getCategories);
router.post('/api/categories', createCategory);

// Wishlist
router.get('/api/wishlist', getWishlist);
router.post('/api/wishlist', addToWishlist);
router.delete('/api/wishlist/:id', removeFromWishlist);

// Cart
router.get('/api/cart', getCart);
router.post('/api/cart/items', addToCart);
router.put('/api/cart/items/:id', updateCartItem);
router.delete('/api/cart/items/:id', removeFromCart);
router.delete('/api/cart', clearCart);

// Orders
router.get('/api/orders', getUserOrders);
router.get('/api/orders/:id', getOrderById);
router.post('/api/orders', createOrder);
router.put('/api/orders/:id/status', updateOrderStatus);

// Payments
router.post('/api/payments/initialize', initializePayment);
router.post('/api/payments/verify/:reference', verifyPayment);
router.post('/api/payments/webhook', eventHandler(async (event) => {
  // Webhook doesn't need CORS preflight handling
  return paymentWebhook(event);
}));
router.get('/api/payments/history', getPaymentHistory);

// Vendor
router.get('/api/vendor/profile', getVendorProfile);
router.put('/api/vendor/profile', updateVendorProfile);
router.get('/api/vendor/dashboard', getVendorDashboard);

// ─── Mount Router ────────────────────────────────────────────────────────────────

app.use(router.handler);

// ─── Start Server ────────────────────────────────────────────────────────────────

const h3Handler = toNodeHandler(app);
let authNodeHandler: ReturnType<typeof authToNodeHandler>;

const server = createServer((req, res) => {
  // Route /api/auth/* directly to Better Auth (bypasses H3)
  if (req.url?.startsWith('/api/auth')) {
    // Inject CORS headers for auth routes
    const origin = req.headers.origin;
    if (origin && (ALLOWED_ORIGINS.includes(origin) || origin.startsWith('http://localhost'))) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      Object.entries(CORS_HEADERS).forEach(([key, value]) => {
        res.setHeader(key, value);
      });
    }
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }
    if (!authNodeHandler) {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Auth not initialized yet' }));
      return;
    }
    return authNodeHandler(req, res);
  }
  // All other routes go through H3
  return h3Handler(req, res);
});
const PORT = process.env.PORT ?? 3000;

// Initialize auth (async Apple JWT) then start listening
initAuth()
  .then(() => {
    // Create the auth handler AFTER initAuth() populates the auth instance
    authNodeHandler = authToNodeHandler(auth.handler);

    server.listen(PORT, () => {
      console.log('\n═══════════════════════════════════════════');
      console.log('  🚀 BexieMart API Server');
      console.log('═══════════════════════════════════════════\n');
      console.log(`  📡 URL:          http://localhost:${PORT}`);
      console.log(`  🗄️  Database:      PostgreSQL (Neon)`);
      console.log(`  🔐 Auth:         Email + Google + Apple`);
      console.log(`  💳 Payments:     Paystack`);
      console.log('\n═══════════════════════════════════════════\n');
    });
  })
  .catch((error: Error) => {
    console.error('❌ Failed to initialize auth:', error.message);
    process.exit(1);
  });

export { app, server };
