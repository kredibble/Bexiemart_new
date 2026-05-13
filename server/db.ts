import { PrismaClient } from '@/generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Use direct (non-pooled) URL — Neon's -pooler endpoint doesn't support pg.Pool used by PrismaPg adapter
const dbUrl = process.env.DATABASE_URL!.replace('-pooler', '');
const pool = new pg.Pool({ connectionString: dbUrl });
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
