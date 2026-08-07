import { Router, Request, Response, NextFunction } from 'express';
import { toolRegistry } from '../modules/tools/tool.registry.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createApiResponse } from '@chatbot/utils';

const router = Router();
router.use(authenticate);

router.post('/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;
    const result = await toolRegistry.executeTool('code_execution', { code }, { userId: req.user!.userId });
    res.status(200).json(createApiResponse(result.success, result.error || 'Code executed', result.result));
  } catch (error) {
    next(error);
  }
});

export default router;
