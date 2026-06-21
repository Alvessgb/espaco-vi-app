import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  if (!process.env.DATABASE_URL) return null;
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = (globalForPrisma.prisma ?? createPrismaClient()) as PrismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
