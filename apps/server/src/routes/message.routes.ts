import { Router } from 'express';
import { messageController } from '../controllers/message.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.delete('/:id', (req, res, next) => messageController.delete(req, res, next));
router.post('/:id/react', (req, res, next) => messageController.react(req, res, next));

export default router;
