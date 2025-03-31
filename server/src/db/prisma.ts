import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

/**
 * Prisma Client Singleton
 * This file creates a singleton instance of Prisma Client to avoid
 * multiple connections to the database in development mode.
 * In production, a new instance is created for each request.
 * This is to prevent issues with connection limits in serverless environments.
 * @example
 * ```ts
 * import { prisma } from "./db/prisma";
 * const users = await prisma.user.findMany();
 * ```
 *
 * @maintainer Piush Bose <dev.bosepiush@gmail.com>
 */
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
