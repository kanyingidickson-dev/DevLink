import { PrismaClient } from "@prisma/client";

/**
 * Prisma client singleton.
 *
 * In development, Next.js HMR can reload modules frequently; caching the client on `globalThis`
 * prevents creating a new DB connection on every reload.
 */

type PrismaGlobal = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as PrismaGlobal;

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
