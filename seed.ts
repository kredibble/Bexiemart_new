/**
 * Database Seed Script — Populates all tables with realistic test data.
 *
 * Usage: npx tsx seed.ts
 *
 * Creates:
 *  - 10 categories
 *  - 10 users (5 customer, 3 vendor, 1 admin, 1 test)
 *  - 3 vendor profiles
 *  - 10 products with images
 *  - 10 shipping addresses
 *  - 10 orders with items
 *  - 10 payments
 *  - 10+ order items
 *  - 5 carts with items
 *  - 5 wishlist entries
 *  - 10 reviews
 *  - 10 notifications
 *  - 5 conversations with messages
 *  - 3 coupons
 *  - 5 stories with views
 *
 * All passwords: "password123"
 */

import "dotenv/config";
import { PrismaClient } from "./src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { hashPassword as baHashPassword } from "@better-auth/utils/password";
import { randomUUID } from "crypto";

// Use direct (non-pooled) URL — Neon's -pooler endpoint doesn't support pg.Pool used by PrismaPg adapter
const dbUrl = process.env.DATABASE_URL!.replace("-pooler", "");
const pool = new pg.Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ── Helpers ──────────────────────────────────────────────────────────────────────

function uid() {
  return randomUUID();
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function hashPassword(pw: string): Promise<string> {
  return baHashPassword(pw);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Data Definitions ─────────────────────────────────────────────────────────────

const CATEGORIES = [
  { name: "Electronics", icon: "laptop-outline", description: "Phones, laptops, tablets & accessories" },
  { name: "Fashion", icon: "shirt-outline", description: "Clothing, shoes, bags & accessories" },
  { name: "Food & Drinks", icon: "fast-food-outline", description: "Meals, snacks, beverages & groceries" },
  { name: "Books & Stationery", icon: "book-outline", description: "Textbooks, novels, notebooks & supplies" },
  { name: "Beauty & Health", icon: "heart-outline", description: "Skincare, makeup, supplements & wellness" },
  { name: "Sports & Fitness", icon: "fitness-outline", description: "Gym gear, sportswear & equipment" },
  { name: "Home & Living", icon: "home-outline", description: "Furniture, decor & kitchenware" },
  { name: "Entertainment", icon: "game-controller-outline", description: "Gaming, movies & music" },
  { name: "Services", icon: "construct-outline", description: "Tutoring, repairs & professional services" },
  { name: "Vehicles", icon: "car-outline", description: "Cars, bikes & accessories" },
];

const USERS = [
  { name: "Kwame Asante", email: "kwame@campus.edu", role: "customer" as const, phone: "0241000001" },
  { name: "Ama Serwaa", email: "ama@campus.edu", role: "customer" as const, phone: "0241000002" },
  { name: "Kofi Mensah", email: "kofi@campus.edu", role: "customer" as const, phone: "0241000003" },
  { name: "Esi Boadu", email: "esi@campus.edu", role: "customer" as const, phone: "0241000004" },
  { name: "Yaw Adomako", email: "yaw@campus.edu", role: "customer" as const, phone: "0241000005" },
  { name: "Nana Yeboah", email: "nana@shop.com", role: "vendor" as const, phone: "0242000001", shopName: "Nana's Electronics", shopDesc: "Premium electronics & gadgets for campus life" },
  { name: "Adwoa Manu", email: "adwoa@shop.com", role: "vendor" as const, phone: "0242000002", shopName: "Adwoa's Fashion Hub", shopDesc: "Trendy fashion for the modern student" },
  { name: "Kwesi Appiah", email: "kwesi@shop.com", role: "vendor" as const, phone: "0242000003", shopName: "Kwesi's Books & More", shopDesc: "Academic books, novels & stationery supplies" },
  { name: "Admin User", email: "admin@bexiemart.com", role: "admin" as const, phone: "0243000001" },
  { name: "Test Customer", email: "test@campus.edu", role: "customer" as const, phone: "0244000001" },
];

const PRODUCTS_DATA = [
  { name: "Wireless Bluetooth Earbuds", price: 299, stock: 50, category: "Electronics", vendorIdx: 0, desc: "High-quality wireless earbuds with noise cancellation and 24hr battery life." },
  { name: "iPhone 14 Pro Max Case", price: 89, stock: 120, category: "Electronics", vendorIdx: 0, desc: "Premium silicone protective case for iPhone 14 Pro Max." },
  { name: "Laptop Backpack 40L", price: 199, stock: 35, category: "Fashion", vendorIdx: 1, desc: "Water-resistant laptop backpack with USB charging port." },
  { name: "Limited Edition Sneakers", price: 459, stock: 20, category: "Fashion", vendorIdx: 1, desc: "Comfortable and stylish sneakers for everyday wear." },
  { name: "Organic Green Tea Pack", price: 45, stock: 200, category: "Food & Drinks", vendorIdx: 0, desc: "Premium organic green tea from the highlands of Ghana." },
  { name: "Campus Meal Bundle", price: 150, stock: 100, category: "Food & Drinks", vendorIdx: 0, desc: "Balanced meal bundle — rice, stew, chicken & veggies." },
  { name: "Engineering Mathematics Textbook", price: 120, stock: 15, category: "Books & Stationery", vendorIdx: 2, desc: "Comprehensive engineering mathematics reference." },
  { name: "Stapler & Stationery Set", price: 35, stock: 75, category: "Books & Stationery", vendorIdx: 2, desc: "Complete desk stationery set with stapler, pins & tape." },
  { name: "Vitamin C Serum 30ml", price: 65, stock: 40, category: "Beauty & Health", vendorIdx: 1, desc: "Brightening vitamin C serum with hyaluronic acid." },
  { name: "Yoga Mat Premium", price: 120, stock: 25, category: "Sports & Fitness", vendorIdx: 0, desc: "Extra thick non-slip yoga mat with carrying strap." },
];

const ADDRESSES_DATA = [
  { first: "Kwame", last: "Asante", phone: "0241000001", email: "kwame@campus.edu", addr: "Room 12, Block A, Men's Hall", city: "Kumasi", state: "Ashanti" },
  { first: "Ama", last: "Serwaa", phone: "0241000002", email: "ama@campus.edu", addr: "Suite 5, Queen's Hall", city: "Accra", state: "Greater Accra" },
  { first: "Kofi", last: "Mensah", phone: "0241000003", email: "kofi@campus.edu", addr: "House 8, Campus Junction", city: "Legon", state: "Greater Accra" },
  { first: "Esi", last: "Boadu", phone: "0241000004", email: "esi@campus.edu", addr: "Flat 3B, Unity Hall", city: "Kumasi", state: "Ashanti" },
  { first: "Yaw", last: "Adomako", phone: "0241000005", email: "yaw@campus.edu", addr: "Room 7, Block C, Science Hostel", city: "Accra", state: "Greater Accra" },
  { first: "Nana", last: "Yeboah", phone: "0242000001", email: "nana@shop.com", addr: "Shop 15, Campus Mall", city: "Kumasi", state: "Ashanti" },
  { first: "Adwoa", last: "Manu", phone: "0242000002", email: "adwoa@shop.com", addr: "Boutique 3, City Center", city: "Accra", state: "Greater Accra" },
  { first: "Kwesi", last: "Appiah", phone: "0242000003", email: "kwesi@shop.com", addr: "Bookstore 8, University Road", city: "Legon", state: "Greater Accra" },
  { first: "Admin", last: "User", phone: "0243000001", email: "admin@bexiemart.com", addr: "Admin Office, Bexie HQ", city: "Accra", state: "Greater Accra" },
  { first: "Test", last: "Customer", phone: "0244000001", email: "test@campus.edu", addr: "Room 1, Test Hall", city: "Accra", state: "Greater Accra" },
];

const REVIEW_COMMENTS = [
  "Great product, exactly as described!",
  "Good quality for the price. Fast delivery too.",
  "Decent product but packaging could be better.",
  "Love it! Will definitely buy again.",
  "Not bad but expected better quality.",
  "Excellent service and product. Highly recommended!",
  "Average quality, does the job.",
  "Perfect! Exceeded my expectations.",
  "Arrived quickly and well-packaged. Happy with purchase.",
  "Would recommend to friends and family.",
];

const NOTIFICATION_TYPES = ["order", "payment", "shipping", "promotion", "system"] as const;
const NOTIFICATION_MESSAGES = [
  { title: "Order Confirmed", msg: "Your order #BEX-{n} has been confirmed and is being processed." },
  { title: "Payment Received", msg: "Payment of GH₵ {a} for order #BEX-{n} was successful." },
  { title: "Order Shipped", msg: "Your order #BEX-{n} has been shipped and is on its way!" },
  { title: "Flash Sale!", msg: "Up to 50% off on selected items. Limited time offer!" },
  { title: "Welcome to BexieMart", msg: "Welcome! Explore thousands of products available on campus." },
  { title: "Order Delivered", msg: "Your order #BEX-{n} has been delivered. Enjoy!" },
  { title: "Price Drop Alert", msg: "Items in your wishlist have dropped in price!" },
  { title: "Review Request", msg: "How was your experience? Leave a review for your recent purchase." },
  { title: "New Vendor", msg: "New stores have joined BexieMart. Check them out!" },
  { title: "Account Updated", msg: "Your account details have been successfully updated." },
];

const CHAT_MESSAGES = [
  "Hi, is this item still available?",
  "Yes, it's in stock!",
  "Great! Can I pick it up today?",
  "Sure, I'm available after 2pm.",
  "Perfect, I'll see you then.",
  "Hello, I'd like to place an order.",
  "Of course! What would you like?",
  "The wireless earbuds please.",
  "Sure, I'll prepare them now.",
  "Thanks a lot!",
];

const STORY_CAPTIONS = [
  "New arrivals just dropped! 🔥",
  "Flash sale - 24 hours only!",
  "Behind the scenes at the shop",
  "Customer pickup 📦",
  "Morning vibes ✨",
];

// ── Main Seed Function ───────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data in reverse dependency order
  console.log("  Cleaning existing data...");
  await prisma.storyView.deleteMany();
  await prisma.story.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationParticipant.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.shippingAddress.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.vendorProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.category.deleteMany();
  await prisma.verification.deleteMany();

  // ── 1. Categories ──────────────────────────────────────────────────
  console.log("  Creating categories...");
  const categories = await Promise.all(
    CATEGORIES.map((c) =>
      prisma.category.create({
        data: { id: uid(), name: c.name, slug: slug(c.name), icon: c.icon, description: c.description },
      })
    )
  );
  console.log(`    ✓ ${categories.length} categories created`);

  function getCategoryByName(name: string) {
    return categories.find((c) => c.name === name)!;
  }

  // ── 2. Users + Accounts ────────────────────────────────────────────
  console.log("  Creating users...");
  const hashedPw = await hashPassword("password123");
  const createdUsers = await Promise.all(
    USERS.map((u) =>
      prisma.user.create({
        data: {
          id: uid(),
          name: u.name,
          email: u.email,
          emailVerified: true,
          role: u.role,
          image: u.role === "vendor"
            ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`
            : undefined,
        },
      })
    )
  );

  // Create credential accounts for password login
  await Promise.all(
    createdUsers.map((u) =>
      prisma.account.create({
        data: {
          id: uid(),
          userId: u.id,
          accountId: u.email,
          providerId: "credential",
          password: hashedPw,
        },
      })
    )
  );
  console.log(`    ✓ ${createdUsers.length} users created (password: password123)`);

  function getUserByEmail(email: string) {
    return createdUsers.find((u) => u.email === email)!;
  }

  // ── 3. Vendor Profiles ──────────────────────────────────────────────
  console.log("  Creating vendor profiles...");
  const vendorUsers = USERS.filter((u) => u.role === "vendor");
  const vendorProfiles = await Promise.all(
    vendorUsers.map((vu) => {
      const user = getUserByEmail(vu.email);
      return prisma.vendorProfile.create({
        data: {
          id: uid(),
          userId: user.id,
          shopName: vu.shopName!,
          slug: slug(vu.shopName!),
          description: vu.shopDesc,
          logo: `https://api.dicebear.com/7.x/identicon/svg?seed=${vu.shopName}`,
          phone: vu.phone,
          city: vu.shopName?.includes("Accra") ? "Accra" : "Kumasi",
          state: vu.shopName?.includes("Accra") ? "Greater Accra" : "Ashanti",
          isActive: true,
        },
      });
    })
  );
  console.log(`    ✓ ${vendorProfiles.length} vendor profiles created`);

  // ── 4. Products + Images ────────────────────────────────────────────
  console.log("  Creating products...");
  const products = await Promise.all(
    PRODUCTS_DATA.map((p, i) => {
      const cat = getCategoryByName(p.category);
      const vendor = vendorProfiles[p.vendorIdx];
      return prisma.product.create({
        data: {
          id: uid(),
          name: p.name,
          slug: slug(p.name),
          description: p.desc,
          price: p.price,
          stock: p.stock,
          categoryId: cat.id,
          vendorId: vendor.id,
          isActive: true,
          isFeatured: i < 4,
          images: {
            create: [
              {
                id: uid(),
                url: `https://picsum.photos/seed/${slug(p.name)}/400/400`,
                isPrimary: true,
                order: 0,
              },
              {
                id: uid(),
                url: `https://picsum.photos/seed/${slug(p.name)}2/400/400`,
                isPrimary: false,
                order: 1,
              },
            ],
          },
        },
        include: { images: true, category: true },
      });
    })
  );
  console.log(`    ✓ ${products.length} products created with images`);

  // ── 5. Shipping Addresses ───────────────────────────────────────────
  console.log("  Creating shipping addresses...");
  const addresses = await Promise.all(
    ADDRESSES_DATA.map((a) => {
      const user = createdUsers.find((u) => u.email === a.email);
      return prisma.shippingAddress.create({
        data: {
          id: uid(),
          userId: user?.id,
          firstName: a.first,
          lastName: a.last,
          phone: a.phone,
          email: a.email,
          address: a.addr,
          city: a.city,
          state: a.state,
          country: "Ghana",
        },
      });
    })
  );
  console.log(`    ✓ ${addresses.length} addresses created`);

  // ── 6. Orders + Items ────────────────────────────────────────────────
  console.log("  Creating orders...");
  const customerUsers = createdUsers.filter((u) => USERS.find((du) => du.email === u.email)?.role === "customer");

  const orders = [];
  const orderStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "delivered", "cancelled"] as const;
  for (let i = 0; i < 10; i++) {
    const customer = pick(customerUsers);
    const status = pick([...orderStatuses]);

    // Create a unique shipping address per order (shippingAddressId is @unique)
    const addrData = ADDRESSES_DATA[i % ADDRESSES_DATA.length];
    const addr = await prisma.shippingAddress.create({
      data: {
        id: uid(),
        userId: customer.id,
        firstName: addrData.first,
        lastName: addrData.last,
        phone: addrData.phone,
        email: addrData.email,
        address: `${addrData.addr}, Order #${1000 + i}`,
        city: addrData.city,
        state: addrData.state,
        country: "Ghana",
      },
    });

    const itemCount = randInt(1, 3);
    const orderProducts: typeof products = [];
    for (let j = 0; j < itemCount; j++) {
      const p = pick(products);
      if (!orderProducts.includes(p)) orderProducts.push(p);
    }

    const subtotal = orderProducts.reduce((s, p) => s + p.price, 0);
    const shipping = 50;
    const total = subtotal + shipping;
    const orderNum = `BEX-${1000 + i}`;

    const order = await prisma.order.create({
      data: {
        id: uid(),
        orderNumber: orderNum,
        userId: customer.id,
        status,
        subtotal,
        shippingFee: shipping,
        tax: 0,
        total,
        paymentStatus: status === "cancelled" ? "failed" : "success",
        paymentMethod: "card",
        paystackRef: `pay_${uid().slice(0, 12)}`,
        shippingAddressId: addr.id,
        items: {
          create: orderProducts.map((p) => ({
            id: uid(),
            productId: p.id,
            productName: p.name,
            productSlug: p.slug,
            price: p.price,
            quantity: 1,
            total: p.price,
            imageUrl: p.images[0]?.url,
          })),
        },
      },
    });
    orders.push(order);
  }
  console.log(`    ✓ ${orders.length} orders created with items`);

  // ── 7. Payments ──────────────────────────────────────────────────────
  console.log("  Creating payments...");
  const payments = await Promise.all(
    orders.map((o) =>
      prisma.payment.create({
        data: {
          id: uid(),
          orderId: o.id,
          userId: o.userId,
          amount: o.total,
          currency: "GHS",
          status: o.paymentStatus,
          paystackRef: o.paystackRef!,
          paymentMethod: "card",
          channel: "card",
          paidAt: o.status !== "cancelled" ? new Date() : undefined,
        },
      })
    )
  );
  console.log(`    ✓ ${payments.length} payments created`);

  // ── 8. Carts + Items ────────────────────────────────────────────────
  console.log("  Creating carts...");
  const cartUsers = customerUsers.slice(0, 5);
  await Promise.all(
    cartUsers.map((u) =>
      prisma.cart.create({
        data: {
          id: uid(),
          userId: u.id,
          items: {
            create: [0, 1].map(() => {
              const p = pick(products);
              return {
                id: uid(),
                productId: p.id,
                productName: p.name,
                price: p.price,
                quantity: randInt(1, 2),
              };
            }),
          },
        },
      })
    )
  );
  console.log(`    ✓ ${cartUsers.length} carts created with items`);

  // ── 9. Wishlist ─────────────────────────────────────────────────────
  console.log("  Creating wishlist entries...");
  const wishlistEntries = await Promise.all(
    [0, 1, 2, 3, 4].map((i) =>
      prisma.wishlist.create({
        data: {
          id: uid(),
          userId: customerUsers[i].id,
          productId: products[i * 2].id,
        },
      })
    )
  );
  console.log(`    ✓ ${wishlistEntries.length} wishlist entries created`);

  // ── 10. Reviews ─────────────────────────────────────────────────────
  console.log("  Creating reviews...");
  const reviews = await Promise.all(
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) =>
      prisma.review.create({
        data: {
          id: uid(),
          userId: customerUsers[i % customerUsers.length].id,
          productId: products[i % products.length].id,
          rating: randInt(3, 5),
          comment: REVIEW_COMMENTS[i],
        },
      })
    )
  );
  console.log(`    ✓ ${reviews.length} reviews created`);

  // ── 11. Notifications ────────────────────────────────────────────────
  console.log("  Creating notifications...");
  const notifications = await Promise.all(
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
      const user = pick(customerUsers);
      const notif = NOTIFICATION_MESSAGES[i % NOTIFICATION_MESSAGES.length];
      return prisma.notification.create({
        data: {
          id: uid(),
          userId: user.id,
          title: notif.title,
          message: notif.msg.replace("{n}", String(1000 + i)).replace("{a}", String(randInt(50, 500))),
          type: pick([...NOTIFICATION_TYPES]),
          isRead: i < 5,
        },
      });
    })
  );
  console.log(`    ✓ ${notifications.length} notifications created`);

  // ── 12. Coupons ──────────────────────────────────────────────────────
  console.log("  Creating coupons...");
  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 30);
  const farFuture = new Date();
  farFuture.setDate(farFuture.getDate() + 90);

  await Promise.all([
    prisma.coupon.create({
      data: { id: uid(), code: "STUDENT10", discountPercent: 10, maxUses: 200, currentUses: 15, expiresAt: farFuture },
    }),
    prisma.coupon.create({
      data: { id: uid(), code: "CAMPUS20", discountPercent: 20, maxUses: 100, currentUses: 8, minOrderAmount: 200, expiresAt: farFuture },
    }),
    prisma.coupon.create({
      data: { id: uid(), code: "WELCOME15", discountPercent: 15, maxUses: 50, currentUses: 3, minOrderAmount: 100, expiresAt: futureDate },
    }),
  ]);
  console.log(`    ✓ 3 coupons created`);

  // ── 13. Conversations + Messages ─────────────────────────────────────
  console.log("  Creating conversations...");
  const convos = await Promise.all(
    [0, 1, 2, 3, 4].map(async (i) => {
      const customer = customerUsers[i % customerUsers.length];
      const vendor = createdUsers.find((u) => USERS.find((du) => du.email === u.email)?.role === "vendor")!;

      const convo = await prisma.conversation.create({
        data: { id: uid() },
      });

      await prisma.conversationParticipant.createMany({
        data: [
          { id: uid(), conversationId: convo.id, userId: customer.id },
          { id: uid(), conversationId: convo.id, userId: vendor.id },
        ],
      });

      // Add a few messages
      const startIdx = (i * 2) % CHAT_MESSAGES.length;
      await Promise.all(
        [0, 1, 2].map((j) => {
          const sender = j % 2 === 0 ? customer : vendor;
          return prisma.message.create({
            data: {
              id: uid(),
              conversationId: convo.id,
              senderId: sender.id,
              content: CHAT_MESSAGES[(startIdx + j) % CHAT_MESSAGES.length],
              createdAt: new Date(Date.now() - (3 - j) * 3600000),
            },
          });
        })
      );

      return convo;
    })
  );
  console.log(`    ✓ ${convos.length} conversations created with messages`);

  // ── 14. Stories + Views ──────────────────────────────────────────────
  console.log("  Creating stories...");
  const storyUsers = createdUsers.filter((u) => {
    const profile = USERS.find((du) => du.email === u.email);
    return profile && (profile.role === "vendor" || profile.role === "customer");
  }).slice(0, 5);

  const stories = await Promise.all(
    storyUsers.map((u, i) =>
      prisma.story.create({
        data: {
          id: uid(),
          userId: u.id,
          mediaUrl: `https://picsum.photos/seed/story${i}/400/700`,
          caption: STORY_CAPTIONS[i],
          expiresAt: new Date(Date.now() + 24 * 3600000),
        },
      })
    )
  );

  // Add some views
  await Promise.all(
    stories.map((s) =>
      prisma.storyView.create({
        data: {
          id: uid(),
          storyId: s.id,
          viewerId: pick(customerUsers).id,
        },
      })
    )
  );
  console.log(`    ✓ ${stories.length} stories created with views`);

  // ── Summary ─────────────────────────────────────────────────────────────────────
  console.log("\n✅ Seed complete! Summary:");
  console.log(`   Categories:      ${categories.length}`);
  console.log(`   Users:           ${createdUsers.length}`);
  console.log(`   Vendor Profiles: ${vendorProfiles.length}`);
  console.log(`   Products:        ${products.length}`);
  console.log(`   Addresses:       ${addresses.length}`);
  console.log(`   Orders:          ${orders.length}`);
  console.log(`   Payments:        ${payments.length}`);
  console.log(`   Carts:           ${cartUsers.length}`);
  console.log(`   Wishlist:        ${wishlistEntries.length}`);
  console.log(`   Reviews:         ${reviews.length}`);
  console.log(`   Notifications:   ${notifications.length}`);
  console.log(`   Coupons:         3`);
  console.log(`   Conversations:   ${convos.length}`);
  console.log(`   Stories:         ${stories.length}`);
  console.log("\n🔑 Login credentials:");
  console.log("   Customer: test@campus.edu / password123");
  console.log("   Vendor:   nana@shop.com / password123");
  console.log("   Admin:    admin@bexiemart.com / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
