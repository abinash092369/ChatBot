import { Request, Response, NextFunction } from 'express';
import { chatService } from '../services/chat.service.js';
import { attachmentService } from '../services/attachment.service.js';
import { createApiResponse } from '@chatbot/utils';
import { AppError } from '../middlewares/error.middleware.js';

export class ChatController {
  public async stream(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const { conversationId, message, model, attachmentIds, systemPrompt, temperature, providerName } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json(createApiResponse(false, 'Message content is required', null));
        return;
      }

      await chatService.streamChat(res, {
        userId: req.user.userId,
        conversationId,
        message,
        model,
        attachmentIds,
        systemPrompt,
        temperature,
        providerName,
      });
    } catch (error) {
      next(error);
    }
  }

  public async regenerate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const { messageId } = req.body;
      if (!messageId) {
        res.status(400).json(createApiResponse(false, 'messageId is required', null));
        return;
      }

      await chatService.regenerateMessage(res, req.user.userId, messageId);
    } catch (error) {
      next(error);
    }
  }

  public async uploadAttachment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      const file = req.file;
      const { conversationId } = req.body;

      if (!file) {
        res.status(400).json(createApiResponse(false, 'No file uploaded', null));
        return;
      }

      const attachment = await attachmentService.processUpload(req.user.userId, conversationId || 'temp', file);
      res.status(201).json(createApiResponse(true, 'File uploaded and processed', attachment));
    } catch (error) {
      next(error);
    }
  }
}

export const chatController = new ChatController();
