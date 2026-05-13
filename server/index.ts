import { createApp, createRouter, eventHandler, setResponseStatus } from 'h3';
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
import { createOrder, getOrderById, updateOrderStatus, getUserOrders, getOrderTracking } from './routes/orders';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from './routes/cart';
import {
  getVendorProfile, updateVendorProfile,
  getVendorStats, getVendorProducts, createVendorProduct, updateVendorProduct, deleteVendorProduct,
  getVendorOrders, getVendorOrderDetail, updateVendorOrderStatus,
  getVendorEarnings, withdrawFunds,
} from './routes/vendor';
import { getNotifications, markAsRead, markAllAsRead } from './routes/notifications';
import { validateCoupon } from './routes/coupons';
import { getWallet, getWalletTransactions, topUpWallet, withdrawFromWallet } from './routes/wallet';
import { getServices, getServiceById } from './routes/services';
import { getReels, likeReel, unlikeReel } from './routes/reels';
import { getProductReviews, createReview } from './routes/reviews';
import { requireAuth, requireVendor } from './middleware/auth';
import { securityHeaders, createOnErrorHandler } from './middleware/security';
import { success, error } from './utils/response';
import { validateEnv } from './utils/env';
import { moderateRateLimit, strictRateLimit } from './utils/rate-limit';
import { prisma } from './db';

// Validate environment variables at startup
validateEnv();

const app = createApp({
  onError: createOnErrorHandler(),
});
const router = createRouter();

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

app.use(corsMiddleware);
app.use(securityHeaders);

// Rate limiting — applied as middleware before router
app.use('/api/upload', strictRateLimit);
app.use('/api/payments', strictRateLimit);
app.use('/api/onboarding', strictRateLimit);
app.use('/api/orders', moderateRateLimit);
app.use('/api/cart', moderateRateLimit);
app.use('/api/wishlist', moderateRateLimit);
app.use('/api/reviews', moderateRateLimit);
app.use('/api/coupons/validate', moderateRateLimit);
app.use('/api/conversations', moderateRateLimit);
app.use('/api/notifications', moderateRateLimit);
app.use('/api/wallet', moderateRateLimit);

// Health
router.get('/api/health', eventHandler(() => ({
  status: 'ok',
  timestamp: new Date().toISOString(),
  database: 'PostgreSQL (Neon)',
  auth: ['email', 'google', 'apple'],
})));

// Upload
router.post('/api/upload', uploadSingle);
router.post('/api/upload/multiple', uploadMultiple);
router.post('/api/upload/signature', generateSignature);
router.delete('/api/upload/:publicId', deleteImage);

// Products (public)
router.get('/api/products', getProducts);
router.get('/api/products/:id', getProductById);
router.post('/api/products', createProduct);
router.put('/api/products/:id', updateProduct);
router.delete('/api/products/:id', deleteProduct);

// Categories
router.get('/api/categories', getCategories);
router.post('/api/categories', createCategory);

// Wishlist (authenticated)
router.get('/api/wishlist', getWishlist);
router.post('/api/wishlist', addToWishlist);
router.delete('/api/wishlist/:id', removeFromWishlist);

// Cart (authenticated)
router.get('/api/cart', getCart);
router.post('/api/cart/items', addToCart);
router.put('/api/cart/items/:id', updateCartItem);
router.delete('/api/cart/items/:id', removeFromCart);
router.delete('/api/cart', clearCart);

// Orders (authenticated)
router.get('/api/orders', getUserOrders);
router.get('/api/orders/:id', getOrderById);
router.post('/api/orders', createOrder);
router.put('/api/orders/:id/status', updateOrderStatus);

// Payments (authenticated)
router.post('/api/payments/initialize', initializePayment);
router.post('/api/payments/verify/:reference', verifyPayment);
router.post('/api/payments/webhook', eventHandler(async (event) => paymentWebhook(event)));
router.get('/api/payments/history', getPaymentHistory);

// Vendor routes (vendor-only)
router.get('/api/vendor/profile', getVendorProfile);
router.patch('/api/vendor/profile', updateVendorProfile);
router.put('/api/vendor/profile', updateVendorProfile);
router.get('/api/vendor/stats', getVendorStats);
router.get('/api/vendor/products', getVendorProducts);
router.post('/api/vendor/products', createVendorProduct);
router.put('/api/vendor/products/:id', updateVendorProduct);
router.delete('/api/vendor/products/:id', deleteVendorProduct);
router.get('/api/vendor/orders', getVendorOrders);
router.get('/api/vendor/orders/:id', getVendorOrderDetail);
router.patch('/api/vendor/orders/:id/status', updateVendorOrderStatus);
router.put('/api/vendor/orders/:id/status', updateVendorOrderStatus);
router.get('/api/vendor/earnings', getVendorEarnings);
router.post('/api/vendor/withdraw', withdrawFunds);

// Vendor Coupons (authenticated vendor)
import {
  getVendorCoupons,
  createVendorCoupon,
  updateVendorCoupon,
  deleteVendorCoupon,
} from './routes/vendor-coupons';

router.get('/api/vendor/coupons', getVendorCoupons);
router.post('/api/vendor/coupons', createVendorCoupon);
router.put('/api/vendor/coupons/:id', updateVendorCoupon);
router.delete('/api/vendor/coupons/:id', deleteVendorCoupon);

// Coupons (public)
router.post('/api/coupons/validate', validateCoupon);

// User profile (authenticated)
import { updateUserProfile } from './routes/user';
router.patch('/api/user/profile', updateUserProfile);

// Notifications (authenticated)
router.get('/api/notifications', getNotifications);
router.patch('/api/notifications/:id/read', markAsRead);
router.post('/api/notifications/read-all', markAllAsRead);

// Wallet (authenticated)
router.get('/api/wallet', getWallet);
router.get('/api/wallet/transactions', getWalletTransactions);
router.post('/api/wallet/topup', topUpWallet);
router.post('/api/wallet/withdraw', withdrawFromWallet);

// Services (public)
router.get('/api/services', getServices);
router.get('/api/services/:id', getServiceById);

// Reels (authenticated)
router.get('/api/reels', getReels);
router.post('/api/reels/:id/like', likeReel);
router.delete('/api/reels/:id/like', unlikeReel);

// Reviews (authenticated)
router.get('/api/products/:productId/reviews', getProductReviews);
router.post('/api/reviews', createReview);

// Chat (authenticated)
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  markConversationRead,
} from './routes/chat';

router.get('/api/conversations', getConversations);
router.post('/api/conversations', getOrCreateConversation);
router.get('/api/conversations/:id/messages', getMessages);
router.post('/api/conversations/:id/messages', sendMessage);
router.patch('/api/conversations/:id/read', markConversationRead);

// Stories (authenticated)
import { getActiveStories, createStory, viewStory, deleteStory } from './routes/stories';

router.get('/api/stories', getActiveStories);
router.post('/api/stories', createStory);
router.post('/api/stories/:id/view', viewStory);
router.delete('/api/stories/:id', deleteStory);

// Order Tracking (authenticated)
router.get('/api/orders/:id/tracking', getOrderTracking);

// Onboarding (authenticated)
router.get('/api/onboarding', eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  const { requireAuth: _ra, requireVendor: _rv, optionalAuth: _oa, ...middleware } = await import('./middleware/auth');
  const existing = await prisma.user.findUnique({ where: { id: user.id } });
  return success({ completed: existing?.onboardingCompleted ?? false });
}));
router.post('/api/onboarding/complete', eventHandler(async (event) => {
  await requireAuth(event);
  const user = event.context.user as { id: string };
  await prisma.user.update({ where: { id: user.id }, data: { onboardingCompleted: true } });
  return success({ ok: true });
}));

// Vendor Dashboard Analytics (authenticated)
router.get('/api/vendor/dashboard/analytics', eventHandler(async (event) => {
  await requireVendor(event);
  const user = event.context.user as { id: string };
  const vendor = await prisma.vendorProfile.findUnique({ where: { userId: user.id } });
  if (!vendor) {
    setResponseStatus(event, 404);
    return error(event as any, 404, 'Vendor profile not found');
  }

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [totalOrders, pendingOrders, recentOrders, revenueData, topProducts] = await Promise.all([
    prisma.order.count({
      where: { items: { some: { product: { vendorId: vendor.id } } } },
    }),
    prisma.order.count({
      where: { status: { in: ['pending', 'confirmed', 'processing'] }, items: { some: { product: { vendorId: vendor.id } } } },
    }),
    prisma.order.findMany({
      where: { items: { some: { product: { vendorId: vendor.id } } }, createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: 'desc' },
      select: { id: true, orderNumber: true, total: true, status: true, createdAt: true },
    }),
    prisma.order.aggregate({
      where: { paymentStatus: 'success', items: { some: { product: { vendorId: vendor.id } } }, createdAt: { gte: thirtyDaysAgo } },
      _sum: { total: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productName'],
      where: { product: { vendorId: vendor.id }, order: { paymentStatus: 'success' } },
      _sum: { quantity: true, total: true },
      orderBy: { _sum: { total: 'desc' } },
      take: 5,
    }),
  ]);

  // Daily revenue for chart
  const dailyRevenue = await prisma.$queryRaw`
    SELECT DATE(o."createdAt") as date, SUM(o.total) as revenue
    FROM "Order" o
    JOIN "OrderItem" oi ON oi."orderId" = o.id
    JOIN "Product" p ON p.id = oi."productId"
    WHERE p."vendorId" = ${vendor.id} AND o."paymentStatus" = 'success' AND o."createdAt" >= ${thirtyDaysAgo}
    GROUP BY DATE(o."createdAt")
    ORDER BY date ASC
  `;

  return success({
    totalOrders,
    pendingOrders,
    recentOrdersCount: recentOrders.length,
    recentOrders,
    revenue30Days: revenueData._sum.total ?? 0,
    dailyRevenue: (dailyRevenue as any[]).map((r: any) => ({
      date: typeof r.date === 'object' ? r.date.toISOString().slice(0, 10) : String(r.date),
      revenue: Number(r.revenue),
    })),
    topProducts: topProducts.map((p: { productName: string; _sum: { quantity: number | null; total: number | null } }) => ({
      name: p.productName,
      quantity: p._sum.quantity ?? 0,
      revenue: p._sum.total ?? 0,
    })),
    totalProducts: await prisma.product.count({ where: { vendorId: vendor.id, isDeleted: false } }),
  });
}));

// ── Admin Routes ──────────────────────────────────────────────────────────────
import {
  getAdminOverview,
  getAdminUsers, getAdminUserDetail, updateUserRole,
  getAdminVendors, toggleVendorStatus,
  getAdminOrders,
  getAdminCategories, createAdminCategory, updateAdminCategory, deleteAdminCategory,
  getAdminProducts, toggleProductStatus,
  getAdminReports,
  getDeliveryHistory,
} from './routes/admin';

router.get('/api/admin/overview', getAdminOverview);
router.get('/api/admin/users', getAdminUsers);
router.get('/api/admin/users/:id', getAdminUserDetail);
router.patch('/api/admin/users/:id/role', updateUserRole);
router.get('/api/admin/vendors', getAdminVendors);
router.patch('/api/admin/vendors/:id/status', toggleVendorStatus);
router.get('/api/admin/orders', getAdminOrders);
router.get('/api/admin/categories', getAdminCategories);
router.post('/api/admin/categories', createAdminCategory);
router.put('/api/admin/categories/:id', updateAdminCategory);
router.delete('/api/admin/categories/:id', deleteAdminCategory);
router.get('/api/admin/products', getAdminProducts);
router.patch('/api/admin/products/:id/status', toggleProductStatus);
router.get('/api/admin/reports', getAdminReports);
router.get('/api/admin/deliveries', getDeliveryHistory);

app.use(router.handler);

const h3Handler = toNodeHandler(app);
let authNodeHandler: ReturnType<typeof authToNodeHandler>;

const server = createServer((req, res) => {
  if (req.url?.startsWith('/api/auth')) {
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
  return h3Handler(req, res);
});

const PORT = process.env.PORT ?? 3000;

initAuth()
  .then(() => {
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
    console.error('Failed to initialize auth:', error.message);
    process.exit(1);
  });

export { app, server };
