import { Router } from 'express';
import multer from 'multer';
import { chatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const upload = multer({
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

const router = Router();

router.use(authenticate);

router.post('/stream', (req, res, next) => chatController.stream(req, res, next));
router.post('/regenerate', (req, res, next) => chatController.regenerate(req, res, next));
router.post('/upload', upload.single('file'), (req, res, next) => chatController.uploadAttachment(req, res, next));

export default router;
