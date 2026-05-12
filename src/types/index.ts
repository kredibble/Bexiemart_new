/**
 * BexieMart Type Definitions
 *
 * Central type registry for the entire application.
 * All API response shapes and shared interfaces live here.
 */

// ── Pagination ──────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ── User & Auth ─────────────────────────────────────────────────────────────────

export type Role = "customer" | "vendor";
export type UserRole = Role; // Alias for backward compatibility

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  shopName?: string;
  shopDescription?: string;
  location?: string;
  contact?: string;
  logo?: string;
  deliveryRange?: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

// ── Products ────────────────────────────────────────────────────────────────────

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: ProductImage[];
  category: Category;
  categoryId: string;
  vendor: VendorProfile;
  vendorId: string;
  stock: number;
  quantity?: number;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isFeatured: boolean;
  tags?: string[];
  deliveryOptions?: { type: string; fee: number; duration: number; unit: string }[];
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  productCount?: number;
}

// ── Vendor ──────────────────────────────────────────────────────────────────────

export interface VendorProfile {
  id: string;
  userId: string;
  shopName: string;
  shopDescription?: string;
  shopLogo?: string;
  shopBanner?: string;
  isVerified: boolean;
  rating: number;
  totalSales: number;
}

// ── Cart ────────────────────────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
}

// ── Orders ──────────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customer?: { name: string; email: string; phone?: string };
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  shippingAddress: ShippingAddress;
  deliveryAddress?: string;
  paymentMethod: string;
  paymentReference?: string;
  isPaid: boolean;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Addresses ───────────────────────────────────────────────────────────────────

export interface ShippingAddress {
  id: string;
  recipientName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode?: string;
  isDefault: boolean;
}

// ── Wishlist ────────────────────────────────────────────────────────────────────

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  createdAt: string;
}

// ── Notifications ───────────────────────────────────────────────────────────────

export type NotificationType =
  | 'order_update'
  | 'promotion'
  | 'system'
  | 'new_order'
  | 'review';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  data?: Record<string, string>;
  createdAt: string;
}

// ── Payments ────────────────────────────────────────────────────────────────────

export interface PaystackPaymentConfig {
  publicKey: string;
  email: string;
  amount: number; // in kobo
  reference: string;
  currency: string;
  channels?: string[];
}

export interface PaymentVerification {
  reference: string;
  status: 'success' | 'failed' | 'abandoned';
  orderId: string;
}

// ── Reviews ─────────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  productId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ── Vendor Earnings ─────────────────────────────────────────────────────────────

export interface VendorEarnings {
  totalEarnings: number;
  pendingEarnings: number;
  availableBalance: number;
  totalWithdrawn: number;
  transactions: EarningsTransaction[];
}

export interface EarningsTransaction {
  id: string;
  type: 'sale' | 'withdrawal' | 'refund';
  amount: number;
  description: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
}

// Alias for API consistency
export type EarningsData = VendorEarnings;
