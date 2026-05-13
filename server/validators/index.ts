import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
});

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
  quantity: z.number().int().positive().default(1),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().positive(),
});

export const createOrderSchema = z.object({
  shippingAddressId: z.string().min(1, 'shippingAddressId is required'),
  deliveryOptionId: z.string().optional(),
  notes: z.string().optional(),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded']),
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().default(''),
  price: z.number().positive('Price must be positive'),
  categoryId: z.string().min(1, 'Category is required'),
  quantity: z.number().int().nonnegative().default(0),
  stock: z.number().int().nonnegative().default(0),
  images: z.array(z.string()).default([]),
});

export const updateProductSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  quantity: z.number().int().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional(),
  categoryId: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export const addToWishlistSchema = z.object({
  productId: z.string().min(1, 'productId is required'),
});

export const updateVendorProfileSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  description: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
});

export const initializePaymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  email: z.string().email('Valid email is required'),
  orderId: z.string().min(1, 'orderId is required'),
  callback_url: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const withdrawSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  destination: z.enum(['bank', 'momo']),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
});

export const updateUserProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  email: z.string().email('Valid email is required').optional(),
  phone: z.string().optional(),
  avatar: z.string().optional(),
  image: z.string().optional(),
});
