import { Request, Response, NextFunction } from 'express';
import { conversationRepository } from '../repositories/conversation.repository.js';
import { createApiResponse } from '@chatbot/utils';
import { AppError } from '../middlewares/error.middleware.js';

export class ConversationController {
  public async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

      const { folderId, isPinned, isArchived, isFavorite, search, page, limit } = req.query;

      const result = await conversationRepository.getUserConversations(req.user.userId, {
        folderId: folderId as string,
        isPinned: isPinned === 'true' ? true : isPinned === 'false' ? false : undefined,
        isArchived: isArchived === 'true' ? true : isArchived === 'false' ? false : undefined,
        isFavorite: isFavorite === 'true' ? true : isFavorite === 'false' ? false : undefined,
        search: search as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 50,
      });

      res.status(200).json(createApiResponse(true, 'Conversations retrieved', result));
    } catch (error) {
      next(error);
    }
  }

  public async getOne(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const conversation = await conversationRepository.findById(id, req.user.userId);
      if (!conversation) {
        throw new AppError('Conversation not found', 404, 'NOT_FOUND');
      }

      res.status(200).json(createApiResponse(true, 'Conversation retrieved', conversation));
    } catch (error) {
      next(error);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { title, isPinned, isArchived, isFavorite, folderId, systemPrompt, model } = req.body;

      await conversationRepository.update(id, req.user.userId, {
        title,
        isPinned,
        isArchived,
        isFavorite,
        folder: folderId ? { connect: { id: folderId } } : undefined,
        systemPrompt,
        model,
      });

      const updated = await conversationRepository.findById(id, req.user.userId);
      res.status(200).json(createApiResponse(true, 'Conversation updated', updated));
    } catch (error) {
      next(error);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await conversationRepository.softDelete(id, req.user.userId);
      res.status(200).json(createApiResponse(true, 'Conversation deleted', null));
    } catch (error) {
      next(error);
    }
  }

  public async getFolders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

      const folders = await conversationRepository.getFolders(req.user.userId);
      res.status(200).json(createApiResponse(true, 'Folders retrieved', folders));
    } catch (error) {
      next(error);
    }
  }

  public async createFolder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

      const { name, color, icon } = req.body;
      const folder = await conversationRepository.createFolder(req.user.userId, name, color, icon);
      res.status(201).json(createApiResponse(true, 'Folder created', folder));
    } catch (error) {
      next(error);
    }
  }
}

export const conversationController = new ConversationController();
