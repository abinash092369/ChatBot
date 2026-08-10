import { Router, Request, Response, NextFunction } from 'express';
import { promptService } from '../modules/enterprise/prompt.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createApiResponse } from '../utils/index.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.query;
    const prompts = await promptService.getPrompts(req.user!.userId, category as string);
    res.status(200).json(createApiResponse(true, 'Prompt templates retrieved', prompts));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { title, content, category, isPublic } = req.body;
    const prompt = await promptService.createPrompt(req.user!.userId, title, content, category, isPublic);
    res.status(201).json(createApiResponse(true, 'Prompt template created', prompt));
  } catch (error) {
    next(error);
  }
});

export default router;
