/**
 * Better Auth Server Configuration
 *
 * This file configures the Better Auth instance with:
 * - Prisma adapter for Neon PostgreSQL (Prisma 7)
 * - Expo plugin for deep linking + secure cookie storage
 * - Google OAuth social provider
 * - Custom 'role' field on User model
 */
import { betterAuth } from "better-auth";
import { expo } from "@better-auth/expo";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({ adapter });

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8081",
  plugins: [expo()],
  trustedOrigins: [
    "bexiemartnew://",
    ...(process.env.NODE_ENV === "development"
      ? ["exp://", "exp://**", "exp://192.168.*.*:*/**"]
      : []),
  ],
  emailAndPassword: { enabled: true },
  socialProviders: {
    google: {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
        returned: true,
      },
    },
  },
});
