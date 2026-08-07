import { Router } from 'express';
import { auditController } from '../controllers/audit.controller.js';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', authorizeRole('ADMIN', 'USER'), (req, res, next) => auditController.getLogs(req, res, next));

export default router;
