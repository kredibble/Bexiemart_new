/**
 * Vendor Routes — Vendor profile and dashboard for BexieMart.
 *
 * GET  /api/vendor/profile          — Get vendor profile
 * PUT  /api/vendor/profile          — Update vendor profile
 * GET  /api/vendor/dashboard        — Get vendor dashboard data
 */
import { eventHandler, readBody, setResponseStatus } from 'h3';

// ─── Get Vendor Profile ──────────────────────────────────────────────────────────

export const getVendorProfile = eventHandler(async (event) => {
  return {
    id: 'temp-vendor-id',
    shopName: 'My Shop',
    slug: 'my-shop',
    description: '',
    logo: null,
    banner: null,
    address: null,
    city: null,
    state: null,
    phone: null,
    isActive: true,
    totalEarnings: 0,
    pendingPayout: 0,
  };
});

// ─── Update Vendor Profile ──────────────────────────────────────────────────────

export const updateVendorProfile = eventHandler(async (event) => {
  const body = await readBody(event);

  if (!body.shopName) {
    setResponseStatus(event, 400);
    return { success: false, error: 'shopName is required' };
  }

  return { success: true, profile: body };
});

// ─── Get Vendor Dashboard ───────────────────────────────────────────────────────

export const getVendorDashboard = eventHandler(async (event) => {
  return {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    recentOrders: [],
    topProducts: [],
  };
});
