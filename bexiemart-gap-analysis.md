# BexieMart — Pencil Design vs Codebase Gap Analysis

## 1. Design Tokens Comparison

### 1.1 Brand Colors

| Token | Design (`bexie.pen`) | Codebase (`colors.ts`) | Match |
|-------|---------------------|----------------------|-------|
| Primary | `#06406BFF` | `#06406B` | ✅ Exact |
| Primary variants | `#06406B00, #06406B33, #06406B66, #06406B99` | — (opacity variants missing) | ⚠️ |
| Accent (CTA) | `#06C760FF, #17BE5AFF, #12B76AFF` | `#22C55E` | ⚠️ Close (design uses 3 green variants, codebase uses 1) |
| Accent Soft | — | `#D1FAE5` | ❌ Missing from design |
| Accent Dark | — | `#065F46` | ❌ Missing from design |

**Observations:** The design uses many shades of green (`#06C760`, `#17BE5A`, `#12B76A`, `#0DD14B`, `#08C514`, etc.) while codebase standardizes on `#22C55E`. The codebase has opacity variants for primary via `rgba`/`alpha` but the design stores them explicitly (`#06406B33`, etc.).

### 1.2 Semantic Colors

| Token | Design | Codebase | Match |
|-------|--------|----------|-------|
| Success | `#27AE60` | `#08A81D` | ❌ |
| Error | `#DC2626, #EA3030, #E33629, #F4283F, #F44336` | `#B3261E` | ⚠️ Multiple reds in design, single in code |
| Warning | `#F2C94C, #F1B11C, #ECA61B, #F79E1B` | `#F59E0B` | ⚠️ |
| Info | `#9747FF, #7F51E0, #6C5CE7` | `#7C3AED` | ⚠️ Close |

**Observations:** Design uses many more semantic color variants than the codebase. Codebase standardizes with soft/dark variants per semantic color, design doesn't.

### 1.3 Neutrals (Text / Background / Border)

| Token | Design | Codebase | Match |
|-------|--------|----------|-------|
| Text primary | Various blacks (`#000000FF` to `#111827FF`) | `#111322` | ⚠️ Close (codebase uses 5F6C7B for secondary) |
| Background | `#F9FAFB, #F5F5F5, #FAFAFA` | `#F8F9FA` | ✅ Close match to surface |
| Border | `#E7E8EB, #E6E6E6, #D1D3D9` | `#E4E7EC` | ✅ Close |
| White | `#FFFFFFFF` | `#FFFFFF` | ✅ Exact |

### 1.4 Typography

| Property | Design (11 families) | Codebase (2 families) | Match |
|----------|---------------------|----------------------|-------|
| Heading | **Nunito Sans** (used in most headings), Rubik, Inter, Poppins, Montserrat, DM Sans | **Rubik** (700Bold, 600SemiBold, 400Regular) | ⚠️ Design uses Nunito Sans for most headings, codebase uses Rubik |
| Body | **Nunito Sans** (primary body font) | **Nunito Sans** (400, 500, 600, 700, 300) | ✅ Match |
| Extra fonts | SF Pro Display, SF Pro Text, Roboto, Plus Jakarta Sans, Raleway | — | ❌ Not in codebase |

**Critical mismatch:** The design uses **Nunito Sans for headings** while the codebase uses **Rubik for headings**. This is a significant visual discrepancy to resolve.

### 1.5 Font Sizes

| Size | Design | Codebase | Match |
|------|--------|----------|-------|
| 10 | ✅ | ✅ (xs) | ✅ |
| 12 | ✅ | ✅ (sm, caption) | ✅ |
| 14 | ✅ | ✅ (base, body, label) | ✅ |
| 16 | ✅ | ✅ (lg, bodyLg, h5) | ✅ |
| 18 | ✅ | ✅ (xl, h4) | ✅ |
| 20 | ✅ | ✅ (2xl, h3) | ✅ |
| 24 | ✅ | ✅ (4xl, h1, stat) | ✅ |
| 28 | ✅ | ✅ (5xl, priceLg) | ✅ |
| 32 | ✅ | ✅ (6xl, display) | ✅ |
| 8, 11, 13, 15, 17, 19, 21, 22, 26, 29, 30, 45, 52, 64, 128 | ✅ | ❌ | Not in codebase presets |

---

## 2. Screen Coverage

### 2.1 Customer Screens

| Design Screen | Codebase Counterpart | Status | Notes |
|---|---|---|---|
| 01 Launch | `LaunchScreen.tsx` | ✅ **Matched** | |
| Login | `SocialSignInScreen.tsx` | ✅ **Matched** | |
| 3 E Create Account Customer | `RegisterScreen.tsx` | ✅ **Matched** | |
| 3 E Create Account Vendor | `RegisterScreen.tsx` (role selector) | ✅ **Matched** | |
| 3.1 B Password Recovery | `ForgotPasswordScreen.tsx` | ✅ **Matched** | |
| 3.1 C Password Recovery — Code | `PasswordVerifyScreen.tsx` | ✅ **Matched** | |
| 3.1 D New Password | `NewPasswordScreen.tsx` | ✅ **Matched** | |
| 3.1 A Wrong Password | — | ❌ **Missing** | No such screen in codebase |
| 3.1 E Login successful | — | ❌ **Missing** | No success screen after login |
| Home | `HomeScreen.tsx` | ✅ **Matched** | |
| 5.0 Search | `SearchBar` component | ⚠️ **Partial** | Design has full search screen; codebase only has search bar header |
| 5.1 Search Results | — | ❌ **Missing** | No dedicated search results screen |
| 5.2 Image Search | — | ❌ **Missing** | Visual/image search feature |
| 5.3 Recognizing Image | — | ❌ **Missing** | Visual search loading state |
| 5.4 Image Recognized | — | ❌ **Missing** | Visual search result |
| 5.5 Image Search Results | — | ❌ **Missing** | Visual search results grid |
| 6.0 Filter | `ShopScreen.tsx` (filter chips) | ⚠️ **Partial** | Design has full filter overlay screen with more options |
| 7.0 Cart | `CartScreen.tsx` | ✅ **Matched** | |
| 7.1 Cart Empty Shown From Wishlist | — | ⚠️ **Partial** | Empty cart state exists but design has variant |
| 7.2 Empty cart | `EmptyState` | ✅ **Matched** | |
| 7.3 Payment | `PaymentScreen.tsx` | ✅ **Matched** | |
| 7.4 Apply Coupon | `CartScreen.tsx` (coupon input) | ⚠️ **Partial** | Design has full coupon overlay screen |
| 7.5 Added Coupon | — | ❌ **Missing** | Coupon added confirmation state |
| 7.6 Edit Delivery Method | `CheckoutScreen.tsx` | ⚠️ **Partial** | |
| 7.7 Payment Method card | `PaymentScreen.tsx` | ⚠️ **Partial** | Design has card + Momo selection |
| 7.8 Payment in progress | — | ❌ **Missing** | Loading overlay during payment |
| 7.9 Payment couldn't process | `PaymentFailureScreen.tsx` | ✅ **Matched** | |
| Payment Done | `PaymentSuccessScreen.tsx` | ✅ **Matched** | |
| 8.1 Wishlist | `FavoritesScreen.tsx` | ✅ **Matched** | Named differently (wishlist vs favorites) |
| 8.2 Wishlist — Empty | `EmptyState` | ✅ **Matched** | |
| 8.3 Recently Viewed | `recentlyViewedStore.ts` + ProductDetails | ⚠️ **Partial** | Data tracked, no dedicated screen |
| 8.4 Recently Viewed Date | — | ❌ **Missing** | Date picker for recently viewed |
| 8.5 Recently Viewed Date Chosen | — | ❌ **Missing** | |
| 9.1 Categories | `HomeScreen.tsx` (chips) | ⚠️ **Partial** | Design has full categories screen |
| 10.1 Top Products | `HomeScreen.tsx` | ✅ **Matched** | |
| 11.1 New Items | `HomeScreen.tsx` | ✅ **Matched** | |
| 12.1 Flash Sale | `HomeScreen.tsx` | ✅ **Matched** | |
| 13.1 Category/Fashion | `AllProductsScreen.tsx` | ✅ **Matched** | |
| 16.1 Food | `FoodScreen.tsx` | ✅ **Matched** | |
| 16.2 Featured Restaurants all | — | ❌ **Missing** | No "all restaurants" screen |
| 16.3 Restaurant Homepage | — | ❌ **Missing** | No restaurant detail screen |
| 18.1 Wallet | `WalletScreen.tsx` | ✅ **Matched** | |
| 18.2 Add Balance | `WalletScreen.tsx` (top up) | ✅ **Matched** | |
| 18.3 Wallet Transfer | — | ❌ **Missing** | Wallet-to-wallet transfer |
| 18.4 Request Withdrawal | `WalletScreen.tsx` (withdraw) | ✅ **Matched** | |
| 18.5 View Transactions | `WalletScreen.tsx` (history) | ✅ **Matched** | |
| Settings Customer | `SettingsScreen.tsx` | ✅ **Matched** | |
| Edit Profile | `SettingsScreen.tsx` | ✅ **Matched** | |
| Change Password | `SettingsScreen.tsx` | ✅ **Matched** | |
| Notification | `SettingsScreen.tsx` (toggles) | ✅ **Matched** | |
| Add New Delivery Address | `CheckoutScreen.tsx` | ⚠️ **Partial** | |
| Delivery Address | `CheckoutScreen.tsx` | ⚠️ **Partial** | |
| Choose Region | — | ❌ **Missing** | Region/state selector screen |
| Terms and Conditions | — | ❌ **Missing** | Legal screen |
| Privacy Policy | — | ❌ **Missing** | Legal screen |
| Payment Card and Momo | `PaymentScreen.tsx` | ⚠️ **Partial** | |
| History of Payment Method | — | ❌ **Missing** | Payment method history |
| Add card / Add Momo / Edit card / Edit Momo | — | ❌ **Missing** | Payment method management |
| About | — | ❌ **Missing** | App info screen |
| Logout | `SettingsScreen.tsx` (sign out) | ✅ **Matched** | |
| Coupon / Coupon is Gonna Expire | — | ❌ **Missing** | Coupon management screens |
| Rate Our Service | — | ❌ **Missing** | In-app rating screen |
| Chat Response / Chat Hello / Chat Agent is Typing / Chat Connecting | `ChatScreen.tsx` | ✅ **Matched** | All chat states present in chat screen |
| Hamburger Menu First Page / messages tap / Coupon Remainder | — | ❌ **Missing** | Hamburger/drawer navigation menu |
| Overview / To review / Review / Review done / Review option | — | ❌ **Missing** | Order review flow screens (post-delivery) |
| 59 To Receive Progress / To receive / Delivered | — | ❌ **Missing** | Order delivery status screens |
| Story | `StoryViewer.tsx` | ✅ **Matched** | |
| 35 Product / 36 Product Flash Sale / 38 Product Variations | `ProductDetailsScreen.tsx` | ⚠️ **Partial** | Product variations overlay missing |
| Product Full | `ProductDetailsScreen.tsx` | ✅ **Matched** | |
| Shop Reviews / Writing review | `ProductDetailsScreen.tsx` (reviews) | ⚠️ **Partial** | |
| Notifications | `NotificationsScreen.tsx` | ✅ **Matched** | |
| Profile | `SettingsScreen.tsx` | ✅ **Matched** | |
| Notification Settings | `SettingsScreen.tsx` | ✅ **Matched** | |
| Verification | — | ❌ **Missing** | Account verification screen |
| Shop | `ShopScreen.tsx` | ✅ **Matched** | |
| Shop View | `ShopScreen.tsx` | ✅ **Matched** | |
| Restaurant View | — | ❌ **Missing** | Restaurant-specific view |
| Services | `ServicesScreen.tsx` | ✅ **Matched** | |
| Services Page | `ServicesScreen.tsx` | ✅ **Matched** | |
| Reels/Products View / Reels/Food View / Reels/Services View | `ReelsScreen.tsx` | ⚠️ **Partial** | Reels screen exists but design has 3 variants (products/food/services) |
| Button Shop | — | ❌ **Missing** | Pre-order/button shop? |
| Live Delivery Map | — | ❌ **Missing** | Real-time delivery map |
| Order Details | `OrderTrackingScreen.tsx` | ✅ **Matched** | |

### 2.2 Vendor Screens

| Design Screen | Codebase Counterpart | Status | Notes |
|---|---|---|---|
| Dashboard (spelled "Dasboard") | `DashboardScreen.tsx` | ✅ **Matched** | |
| Products (spelled "Prducts") | `ProductsScreen.tsx` | ✅ **Matched** | |
| Add Product | `AddEditProductScreen.tsx` | ✅ **Matched** | |
| Edit Products | `AddEditProductScreen.tsx` | ✅ **Matched** | |
| Categories Overlay | — | ❌ **Missing** | Category selection overlay |
| In Stock Overlay | — | ❌ **Missing** | Stock status overlay |
| Orders | `OrdersScreen.tsx` | ✅ **Matched** | |
| Details | `OrderDetailsScreen.tsx` | ✅ **Matched** | |
| Earnings | `EarningsScreen.tsx` | ✅ **Matched** | |
| Request Withdrawal Form | `EarningsScreen.tsx` (withdraw modal) | ✅ **Matched** | |
| Recent Earnings All | `EarningsScreen.tsx` | ✅ **Matched** | |
| Withdrawal History All | `EarningsScreen.tsx` | ✅ **Matched** | |
| Filter: Recent & Withdrawal | — | ❌ **Missing** | Earnings filter |
| Coupons / Coupons Empty State | — | ❌ **Missing** | Vendor coupon management |
| Create Coupon | — | ❌ **Missing** | Coupon creation form |
| Edit Coupon | — | ❌ **Missing** | Coupon editing form |
| Shop Information | — | ❌ **Missing** | Extended shop info screen |
| Discount Type Overlay | — | ❌ **Missing** | Discount type selector |
| Popular Dishes Category | — | ❌ **Missing** | Food category management |
| Food Full | — | ❌ **Missing** | Food item detail/management |
| Add Food | — | ❌ **Missing** | Add food item form |
| 17.1 Before Approval Earn | — | ❌ **Missing** | Pre-approval earnings |
| 17.2 Earn | — | ❌ **Missing** | Earnings overview |
| Profile Settings | `SettingsScreen.tsx` | ✅ **Matched** | |

### 2.3 Admin Dashboard (Entirely Missing from Codebase)

| Design Screen | Codebase Counterpart | Status |
|---|---|---|
| Dashboard / Login | — | ❌ **Entirely missing** |
| Dashboard / Sign Up | — | ❌ **Entirely missing** |
| Dashboard / Overview | — | ❌ **Entirely missing** |
| Dashboard /Vendors | — | ❌ **Entirely missing** |
| Dashboard /Users | — | ❌ **Entirely missing** |
| Dashboard /Rider | — | ❌ **Entirely missing** |
| Dashboard /Orders | — | ❌ **Entirely missing** |
| Dashboard /Products | — | ❌ **Entirely missing** |
| Dashboard /Categories | — | ❌ **Entirely missing** |
| Dashboard /Settings | — | ❌ **Entirely missing** |
| Dashboard /Delivery History | — | ❌ **Entirely missing** |
| Dashboard / Reports | — | ❌ **Entirely missing** |
| Log Out Popup | — | ❌ **Entirely missing** |

---

## 3. Summary Statistics

| Metric | Count |
|--------|-------|
| **Total design screens** | ~142 |
| **Matched (✅)** | 54 screens |
| **Partial match (⚠️)** | 23 screens |
| **Missing from codebase (❌)** | 65 screens |
| **Admin screens (new feature)** | 13 screens |

---

## 4. Priority Action Items

### P0 — Must Fix (Brand Consistency Issues)
1. **Heading font mismatch**: Design uses Nunito Sans for headings, codebase uses Rubik. Decide which is correct and standardize.
2. **Primary accent color**: Design uses multiple greens (`#06C760`, `#17BE5A`, etc.) while codebase uses `#22C55E`. Normalize to one.
3. **Typography scale**: 15+ font sizes in design not in codebase presets. Align the typography scale.

### P1 — Critical Missing Screens (Core Experience)
1. **Admin Dashboard** (13 screens): Full admin panel for vendors, users, riders, orders, products, categories, reports, settings, delivery history.
2. **Coupon Management** (vendor): Create/Edit/List coupons with discount type overlays.
3. **Image Search** (5 screens): Complete visual search feature flow.
4. **Restaurant/Food Management**: Restaurant homepage, food item management, popular dishes.
5. **Live Delivery Map**: Real-time delivery tracking.

### P2 — Important Missing Screens
1. **Hamburger/Drawer Menu**: Navigation menu with messages, coupons, etc.
2. **Order Review Flow**: Post-delivery review screens (Overview, To Review, Review, etc.).
3. **Delivery Address Management**: Choose Region, Add/Edit delivery address screens.
4. **Payment Method Management**: Add/Edit/View cards and Momo accounts.
5. **Coupon Screens** (customer): Coupon list, expiry warnings, rate our service.
6. **Terms & Privacy**: Legal screens.
7. **Wallet Transfer**: Wallet-to-wallet transfer.
8. **Verification Screen**: Account verification flow.
9. **Restaurant View / Featured Restaurants**: Food section enhancements.
10. **Reels Variants**: Products/Food/Services reels views.

### P3 — Nice to Have
1. **Search Result Screen**: Dedicated search results page (vs inline search bar).
2. **Filter Overlay**: Full filter screen with more options vs current chips.
3. **Recently Viewed Date Picker**: View recently viewed by date.
4. **Categories Screen**: Full categories browser.
5. **Login Success / Wrong Password**: Auth state screens.
6. **Payment Loading Overlay**: "Payment in progress" screen.
7. **Product Variations Overlay**: Size/color/quantity selection overlay.
8. **Earnings Filter Screen**: Filter earnings by recent/withdrawal.

---

## 5. Gaps Summary File

A machine-readable gap analysis JSON has been saved to `bexiemart-gap-analysis.json` with the full comparison data.
