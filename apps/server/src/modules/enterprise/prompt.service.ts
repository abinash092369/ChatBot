import { prisma } from '../../database/prisma.service.js';

export class PromptService {
  public async getPrompts(userId: string, category?: string) {
    return prisma.promptTemplate.findMany({
      where: {
        OR: [{ userId }, { isPublic: true }],
        category: category ? category : undefined,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createPrompt(userId: string, title: string, content: string, category = 'General', isPublic = false) {
    return prisma.promptTemplate.create({
      data: {
        userId,
        title,
        content,
        category,
        isPublic,
      },
    });
  }
}

export const promptService = new PromptService();
