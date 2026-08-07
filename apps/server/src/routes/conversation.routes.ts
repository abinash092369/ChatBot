import { Router } from 'express';
import { conversationController } from '../controllers/conversation.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => conversationController.list(req, res, next));
router.get('/folders', (req, res, next) => conversationController.getFolders(req, res, next));
router.post('/folders', (req, res, next) => conversationController.createFolder(req, res, next));
router.get('/:id', (req, res, next) => conversationController.getOne(req, res, next));
router.put('/:id', (req, res, next) => conversationController.update(req, res, next));
router.delete('/:id', (req, res, next) => conversationController.delete(req, res, next));

export default router;
