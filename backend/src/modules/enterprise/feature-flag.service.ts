import { prisma } from '../../database/prisma.service.js';

export class FeatureFlagService {
  public async getFlags() {
    return prisma.featureFlag.findMany({
      orderBy: { name: 'asc' },
    });
  }

  public async toggleFlag(name: string, isEnabled: boolean) {
    return prisma.featureFlag.upsert({
      where: { name },
      update: { isEnabled },
      create: { name, isEnabled },
    });
  }
}

export const featureFlagService = new FeatureFlagService();
