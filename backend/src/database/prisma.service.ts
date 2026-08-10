import { PrismaClient } from '@prisma/client';

class PrismaService {
  private static instance: PrismaClient;

  public static getInstance(): PrismaClient {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaClient({
        log: process.env.DEBUG_PRISMA === 'true' ? ['query', 'error', 'warn'] : ['error', 'warn'],
      });
    }
    return PrismaService.instance;
  }
}

export const prisma = PrismaService.getInstance();
