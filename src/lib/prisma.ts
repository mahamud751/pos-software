import { PrismaClient } from "@prisma/client";

// Declare global variable to prevent multiple instances in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Create or reuse Prisma client
const client = globalThis.prisma || new PrismaClient();

// In development, save the client to the global variable
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = client;
}

export default client;
