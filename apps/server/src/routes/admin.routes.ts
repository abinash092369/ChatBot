import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware.js';
import { createApiResponse } from '@chatbot/utils';
import { prisma } from '../database/prisma.service.js';

const router = Router();
router.use(authenticate);

router.get('/analytics', authorizeRole('ADMIN', 'USER'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalConversations, totalToolExecutions, totalSearches, usageLogs] = await Promise.all([
      prisma.user.count(),
      prisma.conversation.count({ where: { deletedAt: null } }),
      prisma.toolExecution.count(),
      prisma.searchHistory.count(),
      prisma.usageLog.findMany({ take: 20, orderBy: { createdAt: 'desc' } }),
    ]);

    res.status(200).json(
      createApiResponse(true, 'Admin analytics metrics retrieved', {
        metrics: {
          totalUsers,
          totalConversations,
          totalToolExecutions,
          totalSearches,
        },
        usageLogs,
      }),
    );
  } catch (error) {
    next(error);
  }
});

export default router;
