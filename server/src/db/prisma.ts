import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;

  if (tursoUrl && !tursoUrl.startsWith('file:')) {
    return new PrismaClient({
      adapter: new PrismaLibSQL({
        url: tursoUrl,
        authToken: process.env.TURSO_AUTH_TOKEN,
      }),
    });
  }

  return new PrismaClient();
}

export const prisma = createPrismaClient();
