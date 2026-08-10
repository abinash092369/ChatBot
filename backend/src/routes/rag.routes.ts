import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { ragService } from '../modules/rag/rag.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createApiResponse } from '../utils/index.js';

const upload = multer({ limits: { fileSize: 25 * 1024 * 1024 } });
const router = Router();
router.use(authenticate);

router.get('/bases', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bases = await ragService.getKnowledgeBases(req.user!.userId);
    res.status(200).json(createApiResponse(true, 'Knowledge bases retrieved', bases));
  } catch (error) {
    next(error);
  }
});

router.post('/bases', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const base = await ragService.createKnowledgeBase(req.user!.userId, name, description);
    res.status(201).json(createApiResponse(true, 'Knowledge base created', base));
  } catch (error) {
    next(error);
  }
});

router.post('/upload', upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    const { knowledgeBaseId } = req.body;

    if (!file || !knowledgeBaseId) {
      res.status(400).json(createApiResponse(false, 'File and knowledgeBaseId are required', null));
      return;
    }

    const doc = await ragService.uploadDocument(knowledgeBaseId, file);
    res.status(201).json(createApiResponse(true, 'Document processed and vector indexed', doc));
  } catch (error) {
    next(error);
  }
});

router.post('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { knowledgeBaseId, query } = req.body;
    const results = await ragService.searchKnowledgeBase(knowledgeBaseId, query);
    res.status(200).json(createApiResponse(true, 'Semantic vector search results', results));
  } catch (error) {
    next(error);
  }
});

export default router;
