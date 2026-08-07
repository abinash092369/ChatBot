import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service.js';
import { createApiResponse } from '@chatbot/utils';

export class AuditController {
  public async getLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const userId = req.user?.roleName === 'ADMIN' ? (req.query.userId as string) : req.user?.userId;

      const result = await auditService.getLogs(userId, limit, page);
      res.status(200).json(createApiResponse(true, 'Audit logs retrieved', result));
    } catch (error) {
      next(error);
    }
  }
}

export const auditController = new AuditController();
