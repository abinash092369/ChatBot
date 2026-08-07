import { Router, Request, Response, NextFunction } from 'express';
import { toolRegistry } from '../modules/tools/tool.registry.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createApiResponse } from '@chatbot/utils';

const router = Router();
router.use(authenticate);

router.get('/', (req: Request, res: Response) => {
  const tools = toolRegistry.getToolsJsonSchema();
  res.status(200).json(createApiResponse(true, 'Tools discovered', tools));
});

router.post('/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { toolName, input } = req.body;
    if (!toolName) {
      res.status(400).json(createApiResponse(false, 'toolName is required', null));
      return;
    }

    const result = await toolRegistry.executeTool(toolName, input, {
      userId: req.user!.userId,
    });

    res.status(200).json(createApiResponse(result.success, result.error || 'Tool executed', result.result));
  } catch (error) {
    next(error);
  }
});

export default router;
