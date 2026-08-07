import { Router, Request, Response, NextFunction } from 'express';
import { billingService } from '../modules/enterprise/billing.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createApiResponse } from '@chatbot/utils';

const router = Router();
router.use(authenticate);

router.get('/:orgId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = Array.isArray(req.params.orgId) ? req.params.orgId[0] : req.params.orgId;
    const sub = await billingService.getSubscription(orgId);
    res.status(200).json(createApiResponse(true, 'Subscription plan retrieved', sub));
  } catch (error) {
    next(error);
  }
});

router.post('/:orgId/upgrade', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgId = Array.isArray(req.params.orgId) ? req.params.orgId[0] : req.params.orgId;
    const { tier } = req.body;
    const sub = await billingService.updatePlan(orgId, tier);
    res.status(200).json(createApiResponse(true, 'Subscription plan updated', sub));
  } catch (error) {
    next(error);
  }
});

export default router;
