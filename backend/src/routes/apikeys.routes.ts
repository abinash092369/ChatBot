import { Router, Request, Response, NextFunction } from 'express';
import { apiKeyService } from '../modules/enterprise/apikey.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createApiResponse } from '../utils/index.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const keys = await apiKeyService.getUserApiKeys(req.user!.userId);
    res.status(200).json(createApiResponse(true, 'API Keys retrieved', keys));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, organizationId, scopes } = req.body;
    const result = await apiKeyService.generateApiKey(req.user!.userId, organizationId, name, scopes);
    res.status(201).json(createApiResponse(true, 'API Key generated', result));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    await apiKeyService.revokeApiKey(id, req.user!.userId);
    res.status(200).json(createApiResponse(true, 'API Key revoked', null));
  } catch (error) {
    next(error);
  }
});

export default router;
