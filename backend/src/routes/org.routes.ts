import { Router, Request, Response, NextFunction } from 'express';
import { orgService } from '../modules/enterprise/org.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createApiResponse } from '../utils/index.js';

const router = Router();
router.use(authenticate);

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orgs = await orgService.getUserOrganizations(req.user!.userId);
    res.status(200).json(createApiResponse(true, 'Organizations retrieved', orgs));
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug } = req.body;
    const org = await orgService.createOrganization(req.user!.userId, name, slug || name);
    res.status(201).json(createApiResponse(true, 'Organization created', org));
  } catch (error) {
    next(error);
  }
});

router.post('/:id/workspaces', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { name, slug } = req.body;
    const ws = await orgService.createWorkspace(id, name, slug || name);
    res.status(201).json(createApiResponse(true, 'Workspace created', ws));
  } catch (error) {
    next(error);
  }
});

router.get('/:id/members', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const members = await orgService.getMembers(id);
    res.status(200).json(createApiResponse(true, 'Members retrieved', members));
  } catch (error) {
    next(error);
  }
});

router.post('/:id/invite', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { email, role } = req.body;
    const invitation = await orgService.inviteMember(id, email, role || 'MEMBER');
    res.status(200).json(createApiResponse(true, 'Invitation sent', invitation));
  } catch (error) {
    next(error);
  }
});

export default router;
