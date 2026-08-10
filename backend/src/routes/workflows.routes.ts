import { Router, Request, Response, NextFunction } from 'express';
import { workflowService } from '../modules/workflow/workflow.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createApiResponse } from '../utils/index.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = await workflowService.getWorkflows(req.user!.userId);
    res.status(200).json(createApiResponse(true, 'Workflows retrieved', list));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, steps } = req.body;
    const workflow = await workflowService.createWorkflow(req.user!.userId, name, description, steps || []);
    res.status(201).json(createApiResponse(true, 'Workflow created', workflow));
  } catch (error) {
    next(error);
  }
});

router.post('/:id/execute', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const task = await workflowService.executeWorkflow(req.user!.userId, id, req.body.input);
    res.status(200).json(createApiResponse(true, 'Workflow execution task started', task));
  } catch (error) {
    next(error);
  }
});

export default router;
