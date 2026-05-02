# 🛒 BexieMart

<div align="center">

**"Shop Smart, Live Easy — Your Campus Marketplace"**

[![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB?logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2055-000020?logo=expo)](https://expo.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![NativeWind](https://img.shields.io/badge/NativeWind-v5-06B6D4?logo=tailwindcss)](https://www.nativewind.dev/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

</div>

---

## 📖 Overview

**BexieMart** is a campus marketplace mobile application that connects student buyers with campus-based vendors. Users can browse products, manage a cart, place orders with Paystack payments, and sellers can manage inventory, process orders, and track earnings.

This is a **React Native (Expo) rebuild** of an existing Flutter frontend, now connected to a production NestJS/Prisma backend.

### 🔄 Why the Rebuild?

| Before (Flutter) | After (React Native) |
|------------------|---------------------|
| 100% mock data | Live API integration |
| Simulated authentication | Real JWT auth with token refresh |
| No backend connection | Fully connected to NestJS API |
| No payment processing | Paystack integration (GHS) |

---

## 👥 Team

| Role | Dev | Primary Domain |
|------|-----|---------------|
| **Infrastructure & Auth Lead** | Dev A | Navigation, API layer, state management, theme, types, auth, checkout |
| **Customer Browse Lead** | Dev B | Home, Shop, Product Details, Favorites, vendor orders & earnings |
| **Cart & Payments Lead** | Dev C | Cart, checkout UI, Paystack WebView, shared UI components |
| **Vendor Experience Lead** | Dev D | Dashboard, product CRUD, image upload, order management, settings |

📋 **[Full Sprint Plans →](./sprints/MASTER_PLAN.md)**

---

## 🏗️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | React Native (Expo managed) | SDK 55 / RN 0.83 |
| **Language** | TypeScript (strict) | 5.x |
| **Navigation** | React Navigation | 7.x |
| **Server State** | TanStack Query (React Query) | 5.x |
| **Client State** | Zustand | 5.x |
| **HTTP Client** | Axios | 1.x |
| **Forms** | React Hook Form + Zod | 7.x / 3.x |
| **Styling** | NativeWind (Tailwind CSS) | v5 preview |
| **Images** | expo-image | 2.x |
| **Payments** | Paystack (WebView) | — |
| **Secure Storage** | expo-secure-store | 14.x |
| **Fonts** | expo-font (Raleway + Nunito) | 13.x |
| **Image Picker** | expo-image-picker | 16.x |
| **Image Upload** | Cloudinary | — |
| **Linting** | ESLint + Prettier | — |

---

## 🎨 Design System

| Category | Tokens |
|----------|--------|
| **Primary Color** | `#004CFF` |
| **Headings** | Raleway (Bold 700, SemiBold 600, Medium 500) |
| **Body** | Nunito (Light 300 → Bold 700) |
| **Spacing** | 4pt grid (4, 8, 12, 16, 20, 24, 32, 64) |
| **Border Radius** | 4px → 50px → pill |

📁 **[Theme Files →](./theme/)**

```
theme/
├── colors.ts       # 40+ color constants
├── typography.ts   # Font families, sizes, weights, text presets
├── spacing.ts      # Spacing, radii, shadows, dimensions
├── global.css      # NativeWind v5 CSS config + component classes
└── index.ts        # Barrel export
```

---

## 📁 Project Structure

```
src/
├── navigation/              # React Navigation configuration
│   ├── RootNavigator.tsx     # Auth gate (Auth vs Main)
│   ├── AuthNavigator.tsx     # Launch → Login → Register → ForgotPassword
│   ├── CustomerTabs.tsx      # Home | Shop | Food | Earn | Wallet
│   └── VendorTabs.tsx        # Dashboard | Products | Orders | Earnings | Settings
│
├── screens/
│   ├── auth/                 # Launch, Login, Register, ForgotPassword
│   ├── customer/             # Home, Shop, ProductDetails, Cart, Checkout, etc.
│   ├── vendor/               # Dashboard, Products, Orders, Earnings, Settings
│   └── shared/               # Notifications
│
├── components/
│   ├── ui/                   # Button, FormInput, LoadingSpinner, EmptyState, etc.
│   ├── product/              # ProductCard, ProductGrid, CategoryCard
│   ├── cart/                 # CartItem, CartSummary
│   └── vendor/               # StatsCard, OrderStatusBadge
│
├── api/                      # Axios API modules
│   ├── client.ts             # Base instance with JWT interceptors
│   ├── auth.ts               # Login, register, forgot password
│   ├── products.ts           # Products CRUD, categories
│   ├── cart.ts               # Cart operations
│   ├── orders.ts             # Order creation, listing, status
│   ├── payments.ts           # Paystack initialize + verify
│   └── vendor.ts             # Vendor dashboard, products, orders, earnings
│
├── hooks/                    # TanStack Query hooks
│   ├── useAuth.ts            # useLogin, useRegister, useLogout, useCurrentUser
│   ├── useProducts.ts        # useProducts, useProduct, useCategories, useSearch
│   ├── useCart.ts            # useCart, useAddToCart, useUpdateCartItem, useRemoveFromCart
│   ├── useOrders.ts          # useCreateOrder, useOrders, useOrderDetail
│   └── useVendor.ts          # useVendorStats, useVendorProducts, etc.
│
├── stores/                   # Zustand stores
│   ├── authStore.ts          # User, tokens, role, isAuthenticated
│   └── cartStore.ts          # Cart items, count, subtotal, coupon
│
├── theme/                    # Design tokens (see above)
├── types/                    # TypeScript interfaces
└── utils/                    # Storage, formatting, validation, constants
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10 or **yarn** ≥ 1.22
- **Expo CLI** (`npm install -g expo-cli`)
- **iOS** — Xcode 16+ (macOS only)
- **Android** — Android Studio + SDK 35+

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd bexiemart-rn

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your backend API URL and Paystack keys

# Start the dev server
npx expo start
```

### Environment Variables

```env
# Backend API
API_BASE_URL=https://api.bexiemart.com

# Paystack
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_UPLOAD_PRESET=xxxxx
```

### Running on Device

```bash
# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Physical device — scan QR code with Expo Go
npx expo start
```

### Building for Production

```bash
# iOS (TestFlight)
eas build --platform ios --profile production

# Android (Play Internal Testing)
eas build --platform android --profile production
```

---

## 🧪 Testing

```bash
# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Run tests (when added)
npm test
```

### Manual Test Checklist

- [ ] Register → Login (Customer)
- [ ] Register → Login (Vendor)
- [ ] Browse Home → Search → Product Details
- [ ] Add to Cart → View Cart → Checkout
- [ ] Paystack Payment (test mode)
- [ ] Vendor Dashboard → Add Product → Edit → Delete
- [ ] Vendor Orders → View → Update Status
- [ ] Vendor Earnings → View → Withdraw
- [ ] Token refresh (wait 15 min, verify)
- [ ] Airplane mode (graceful offline states)

---

## 🔌 Backend API

This frontend connects to the **BexieMart NestJS backend**. See the server repository for API documentation.

**Key endpoints used:**

| Module | Endpoints |
|--------|-----------|
| **Auth** | `POST /auth/login`, `POST /auth/register`, `POST /auth/forgot-password`, `POST /auth/reset-password`, `GET /auth/me` |
| **Products** | `GET /products`, `GET /products/:id`, `GET /products/categories` |
| **Cart** | `GET /cart`, `POST /cart`, `PUT /cart/:id`, `DELETE /cart/:id` |
| **Orders** | `POST /orders`, `GET /orders`, `GET /orders/:id`, `PATCH /orders/:id/status` |
| **Payments** | `POST /payments/initialize`, `GET /payments/verify/:reference` |
| **Wishlist** | `GET /wishlist`, `POST /wishlist`, `DELETE /wishlist/:id` |
| **Vendor** | `GET /vendor/stats`, CRUD products, GET orders, GET earnings |
| **Notifications** | `GET /notifications`, `PATCH /notifications/:id/read` |

---

## 📋 Timeline

| Week | Focus | Milestone |
|------|-------|-----------|
| **1** | Foundation + Auth | Register, login, role-based routing, JWT, component library |
| **2** | Customer Browsing + Vendor Products | Browse, search, product details, cart, favorites, vendor CRUD |
| **3** | Checkout + Vendor Management | Full purchase flow (Paystack), orders, earnings, withdrawal |
| **4** | Polish + Ship | Settings, notifications, error handling, accessibility, App Store submission |

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [**PRD**](./PRD.md) | Full product requirements — scope, screens, API contracts, design system, tech architecture |
| [**Sprint Master Plan**](./sprints/MASTER_PLAN.md) | Week-by-week ownership map, dependencies, milestones |
| [**Dev A — Infrastructure**](./sprints/DEV-A_INFRASTRUCTURE.md) | Daily tasks: navigation, API client, auth, checkout |
| [**Dev B — Customer Browse**](./sprints/DEV-B_CUSTOMER_BROWSE.md) | Daily tasks: auth screens, product discovery, vendor orders |
| [**Dev C — Cart & Payments**](./sprints/DEV-C_CART_PAYMENTS.md) | Daily tasks: cart, checkout UI, Paystack, shared components |
| [**Dev D — Vendor**](./sprints/DEV-D_VENDOR.md) | Daily tasks: dashboard, product CRUD, orders, earnings |

---

## 📄 License

MIT © BexieMart Team

---

<div align="center">

Built with 🍀 by the BexieMart team

</div>
