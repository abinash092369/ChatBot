import { prisma } from '../database/prisma.service.js';
import { RoleType, MessageStatus, Prisma } from '@prisma/client';

export class MessageRepository {
  public async create(data: {
    conversationId: string;
    role: RoleType;
    content: string;
    model?: string;
    parentId?: string;
    status?: MessageStatus;
    tokensUsed?: number;
  }) {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
        model: data.model,
        parentId: data.parentId,
        status: data.status || 'COMPLETED',
        tokensUsed: data.tokensUsed || 0,
      },
      include: {
        attachments: true,
        reactions: true,
      },
    });
  }

  public async findById(id: string) {
    return prisma.message.findUnique({
      where: { id },
      include: { attachments: true, reactions: true },
    });
  }

  public async updateContent(id: string, content: string, status?: MessageStatus, tokensUsed?: number) {
    return prisma.message.update({
      where: { id },
      data: {
        content,
        status: status || undefined,
        tokensUsed: tokensUsed !== undefined ? tokensUsed : undefined,
      },
      include: { attachments: true, reactions: true },
    });
  }

  public async deleteMessage(id: string) {
    return prisma.message.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  public async addReaction(messageId: string, userId: string, reaction: string) {
    return prisma.messageReaction.upsert({
      where: { messageId_userId_reaction: { messageId, userId, reaction } },
      update: {},
      create: { messageId, userId, reaction },
    });
  }

  public async removeReaction(messageId: string, userId: string, reaction: string) {
    return prisma.messageReaction.deleteMany({
      where: { messageId, userId, reaction },
    });
  }
}

export const messageRepository = new MessageRepository();
