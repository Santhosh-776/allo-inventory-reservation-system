import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "./logger";

declare global {
  // Prevent multiple instances in development (hot-reload)
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not set.");
  }

  // Prisma 7 requires an adapter for direct database connections.
  // Using @prisma/adapter-pg for PostgreSQL (Supabase compatible).
  const adapter = new PrismaPg({ connectionString });

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? [
            { emit: "event", level: "query" },
            { emit: "stdout", level: "error" },
            { emit: "stdout", level: "warn" },
          ]
        : [{ emit: "stdout", level: "error" }],
  });
}

const prisma: PrismaClient =
  globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV === "development") {
  // Log slow queries in development
  // @ts-expect-error – Prisma event typing workaround
  prisma.$on("query", (e: { query: string; duration: number }) => {
    if (e.duration > 200) {
      logger.warn("Slow Prisma query detected", {
        query: e.query,
        durationMs: e.duration,
      });
    }
  });

  globalThis.__prisma = prisma;
}

export { prisma };
