import { prisma } from '../../database/prisma.service.js';
import crypto from 'crypto';

export class ApiKeyService {
  public async generateApiKey(userId: string, organizationId?: string, name = 'Default API Key', scopes?: string[]) {
    const rawKey = `sk_live_${crypto.randomBytes(24).toString('hex')}`;
    const keyPrefix = rawKey.substring(0, 12);
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKeyRecord = await prisma.apiKey.create({
      data: {
        userId,
        organizationId,
        name,
        keyPrefix,
        keyHash,
        scopes: scopes || ['*'],
      },
    });

    return {
      apiKey: rawKey,
      record: apiKeyRecord,
    };
  }

  public async getUserApiKeys(userId: string) {
    return prisma.apiKey.findMany({
      where: { userId, isRevoked: false },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        scopes: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });
  }

  public async revokeApiKey(id: string, userId: string) {
    return prisma.apiKey.updateMany({
      where: { id, userId },
      data: { isRevoked: true },
    });
  }
}

export const apiKeyService = new ApiKeyService();
