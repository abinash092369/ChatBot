import { prisma } from '../database/prisma.service.js';

export class AttachmentRepository {
  public async create(data: {
    conversationId: string;
    messageId?: string;
    filename: string;
    mimeType: string;
    size: number;
    url: string;
    fileKey?: string;
    extractedText?: string;
  }) {
    return prisma.attachment.create({ data });
  }

  public async linkToMessage(attachmentIds: string[], messageId: string) {
    return prisma.attachment.updateMany({
      where: { id: { in: attachmentIds } },
      data: { messageId },
    });
  }

  public async findByConversationId(conversationId: string) {
    return prisma.attachment.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
    });
  }
}

export const attachmentRepository = new AttachmentRepository();
