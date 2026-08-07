import { Router, Request, Response, NextFunction } from 'express';
import { featureFlagService } from '../modules/enterprise/feature-flag.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createApiResponse } from '@chatbot/utils';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flags = await featureFlagService.getFlags();
    res.status(200).json(createApiResponse(true, 'Feature flags retrieved', flags));
  } catch (error) {
    next(error);
  }
});

router.post('/toggle', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, isEnabled } = req.body;
    const flag = await featureFlagService.toggleFlag(name, isEnabled);
    res.status(200).json(createApiResponse(true, 'Feature flag updated', flag));
  } catch (error) {
    next(error);
  }
});

export default router;
