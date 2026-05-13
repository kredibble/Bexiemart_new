const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'PAYSTACK_SECRET_KEY',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
] as const;

const OPTIONAL_ENV_VARS = [
  'PAYSTACK_PUBLIC_KEY',
  'PAYSTACK_WEBHOOK_SECRET',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'APPLE_CLIENT_ID',
  'APPLE_CLIENT_SECRET',
] as const;

export function validateEnv(): void {
  const missing: string[] = [];

  for (const key of REQUIRED_ENV_VARS) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    console.error('\n═══════════════════════════════════════════');
    console.error('  ❌ MISSING REQUIRED ENVIRONMENT VARIABLES');
    console.error('═══════════════════════════════════════════\n');
    for (const key of missing) {
      console.error(`     ${key}`);
    }
    console.error('\n  Please set these in your .env file or environment.\n');
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production') {
    if (!process.env.PAYSTACK_WEBHOOK_SECRET) {
      console.warn('⚠️  PAYSTACK_WEBHOOK_SECRET not set — webhook verification will fail');
    }
  }

  console.log('  ✅ Environment variables validated');
}

export function getEnvVar(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}
