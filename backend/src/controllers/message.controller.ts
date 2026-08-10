import { Request, Response, NextFunction } from 'express';
import { messageRepository } from '../repositories/message.repository.js';
import { createApiResponse } from '../utils/index.js';
import { AppError } from '../middlewares/error.middleware.js';

export class MessageController {
  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      await messageRepository.deleteMessage(id);
      res.status(200).json(createApiResponse(true, 'Message deleted', null));
    } catch (error) {
      next(error);
    }
  }

  public async react(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');

      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { reaction } = req.body;
      const result = await messageRepository.addReaction(id, req.user.userId, reaction);
      res.status(200).json(createApiResponse(true, 'Reaction added', result));
    } catch (error) {
      next(error);
    }
  }
}

export const messageController = new MessageController();
