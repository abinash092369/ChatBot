import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/user.service.js';
import { createApiResponse } from '@chatbot/utils';

export class UserController {
  public async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createApiResponse(false, 'Unauthorized', null));
        return;
      }
      const profile = await userService.getProfile(req.user.userId);
      res.status(200).json(createApiResponse(true, 'User profile retrieved', profile));
    } catch (error) {
      next(error);
    }
  }

  public async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createApiResponse(false, 'Unauthorized', null));
        return;
      }
      const updated = await userService.updateProfile(req.user.userId, req.body);
      res.status(200).json(createApiResponse(true, 'Profile updated successfully', updated));
    } catch (error) {
      next(error);
    }
  }

  public async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json(createApiResponse(false, 'Unauthorized', null));
        return;
      }
      const preferences = await userService.updatePreferences(req.user.userId, req.body);
      res.status(200).json(createApiResponse(true, 'Preferences updated successfully', preferences));
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
