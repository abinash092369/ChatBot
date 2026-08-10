import { prisma } from '../database/prisma.service.js';
import { Prisma } from '@prisma/client';

export class ConversationRepository {
  public async findById(id: string, userId: string) {
    return prisma.conversation.findFirst({
      where: { id, userId, deletedAt: null },
      include: {
        folder: true,
        tags: { include: { tag: true } },
        messages: {
          where: { deletedAt: null },
          orderBy: { createdAt: 'asc' },
          include: { attachments: true, reactions: true },
        },
      },
    });
  }

  public async getUserConversations(
    userId: string,
    options: {
      folderId?: string;
      isPinned?: boolean;
      isArchived?: boolean;
      isFavorite?: boolean;
      search?: string;
      page?: number;
      limit?: number;
    } = {},
  ) {
    const page = options.page || 1;
    const limit = options.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.ConversationWhereInput = {
      userId,
      deletedAt: null,
      folderId: options.folderId !== undefined ? options.folderId : undefined,
      isPinned: options.isPinned !== undefined ? options.isPinned : undefined,
      isArchived: options.isArchived !== undefined ? options.isArchived : false,
      isFavorite: options.isFavorite !== undefined ? options.isFavorite : undefined,
    };

    if (options.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { messages: { some: { content: { contains: options.search, mode: 'insensitive' } } } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.conversation.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        take: limit,
        skip,
        include: {
          folder: true,
          tags: { include: { tag: true } },
          _count: { select: { messages: true } },
        },
      }),
      prisma.conversation.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  public async create(data: Prisma.ConversationCreateInput) {
    return prisma.conversation.create({
      data,
      include: {
        folder: true,
        tags: { include: { tag: true } },
      },
    });
  }

  public async update(id: string, userId: string, data: Prisma.ConversationUpdateInput) {
    return prisma.conversation.updateMany({
      where: { id, userId, deletedAt: null },
      data,
    });
  }

  public async softDelete(id: string, userId: string) {
    return prisma.conversation.updateMany({
      where: { id, userId, deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  // Folders
  public async getFolders(userId: string) {
    return prisma.conversationFolder.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: { _count: { select: { conversations: true } } },
    });
  }

  public async createFolder(userId: string, name: string, color?: string, icon?: string) {
    return prisma.conversationFolder.create({
      data: { userId, name, color, icon },
    });
  }

  public async deleteFolder(id: string, userId: string) {
    return prisma.conversationFolder.deleteMany({
      where: { id, userId },
    });
  }
}

export const conversationRepository = new ConversationRepository();
