import { Router, Request, Response, NextFunction } from 'express';
import { toolRegistry } from '../modules/tools/tool.registry.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createApiResponse } from '../utils/index.js';
import { prisma } from '../database/prisma.service.js';

const router = Router();
router.use(authenticate);

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { query } = req.body;
    if (!query) {
      res.status(400).json(createApiResponse(false, 'Search query required', null));
      return;
    }

    const result = await toolRegistry.executeTool('web_search', { query }, { userId: req.user!.userId });

    await prisma.searchHistory.create({
      data: {
        userId: req.user!.userId,
        query,
        provider: 'duckduckgo',
        resultsCount: result.result?.results?.length || 0,
      },
    });

    res.status(200).json(createApiResponse(true, 'Web search completed', result.result));
  } catch (error) {
    next(error);
  }
});

export default router;
