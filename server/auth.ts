/**
 * Better Auth Configuration — Shared between server and CLI migrations.
 *
 * Database: Native PostgreSQL (pg.Pool) — no ORM adapter needed.
 * Auth: Email + Google + Apple OAuth.
 *
 * Migrate: npx auth@latest migrate --config server/auth.ts
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { betterAuth } from 'better-auth';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { importPKCS8, SignJWT } from 'jose';

// ─── Database Pool (Neon Serverless — WebSocket transport) ──────────────────────
// Uses WebSockets to bypass network firewalls that block TCP port 5432.

neonConfig.webSocketConstructor = ws;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

// ─── Apple Client Secret JWT Generator ──────────────────────────────────────────
// Apple requires a JWT signed with ES256, max expiry 6 months.

async function generateAppleClientSecret(): Promise<string> {
  const clientId = process.env.APPLE_CLIENT_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY;

  // Guard: Apple env vars are optional during development
  if (!clientId || !teamId || !keyId || !privateKey) {
    console.warn('  ⚠️  Apple Sign-In env vars missing — Apple OAuth disabled');
    return '';
  }

  const key = await importPKCS8(privateKey, 'ES256');
  const now = Math.floor(Date.now() / 1000);

  return new SignJWT({})
    .setProtectedHeader({ alg: 'ES256', kid: keyId })
    .setIssuer(teamId)
    .setSubject(clientId)
    .setAudience('https://appleid.apple.com')
    .setIssuedAt(now)
    .setExpirationTime(now + 180 * 24 * 60 * 60) // 6 months
    .sign(key);
}

// ─── Build Auth Config (async factory to avoid top-level await) ─────────────────

/** Memoized auth instance — populated by `initAuth()` */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _auth: any;

function createAuth(appleClientSecret: string) {
  // Only include Apple provider when credentials are available
  const appleProvider = appleClientSecret
    ? {
        apple: {
          clientId: process.env.APPLE_CLIENT_ID as string,
          clientSecret: appleClientSecret,
          appBundleIdentifier: process.env.APPLE_APP_BUNDLE_IDENTIFIER as string,
        },
      }
    : {};

  return betterAuth({
    database: pool,
    baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 3000}`,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
    },
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        accessType: 'offline',
        prompt: 'select_account',
      },
      ...appleProvider,
    },
    plugins: [],
    trustedOrigins: [
      `http://localhost:${process.env.PORT || 3000}`,
      'http://localhost:8081',
      'http://localhost:8082',
      'http://localhost:19000',
      'http://localhost:19006',
      'http://localhost:5173',
      'https://appleid.apple.com',
    ],
    advanced: {
      cookiePrefix: 'bexiemart',
      defaultCookieAttributes: {
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    experimental: { joins: true },
    user: {
      additionalFields: {
        role: {
          type: 'string',
          required: false,
          defaultValue: 'customer',
          input: false,
        },
      },
    },
  });
}

/**
 * Initialize the auth instance asynchronously.
 * Must be called (and awaited) before the server starts listening.
 *
 * Also creates lowercase views for Better Auth (Kysely) compatibility.
 * Prisma creates PascalCase tables (User, Session, Account, Verification)
 * but Better Auth's Kysely adapter expects lowercase names.
 */
export async function initAuth(): Promise<void> {
  // Create lowercase views so Kysely can query PascalCase tables
  const viewPairs = [
    ['user', '"User"'],
    ['session', '"Session"'],
    ['account', '"Account"'],
    ['verification', '"Verification"'],
  ];
  for (const [view, table] of viewPairs) {
    try {
      await pool.query(`CREATE OR REPLACE VIEW "${view}" AS SELECT * FROM ${table}`);
    } catch (err) {
      console.warn(`  ⚠️  Failed to create view "${view}":`, (err as Error).message);
    }
  }

  const appleSecret = await generateAppleClientSecret();
  _auth = createAuth(appleSecret);
}

/** Lazily access the auth instance. Throws if `initAuth()` hasn't run yet. */
export function getAuth() {
  if (!_auth) {
    throw new Error('Auth not initialized — call initAuth() before starting the server');
  }
  return _auth;
}

// Export a proxy so existing imports of `auth` keep working.
// The proxy defers property access to the real instance, which is ready after initAuth().
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const auth: any = new Proxy({}, {
  get(_target, prop, receiver) {
    return Reflect.get(getAuth(), prop, receiver);
  },
});
