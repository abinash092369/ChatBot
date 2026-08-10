import { Router, Request, Response, NextFunction } from 'express';
import { imageGenService } from '../modules/media/image-gen.service.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { createApiResponse } from '../utils/index.js';

const router = Router();
router.use(authenticate);

router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { prompt, width, height, aspectRatio } = req.body;
    if (!prompt) {
      res.status(400).json(createApiResponse(false, 'Image prompt is required', null));
      return;
    }

    const result = await imageGenService.generateImage(req.user!.userId, prompt, { width, height, aspectRatio });
    res.status(200).json(createApiResponse(true, 'Image generated successfully', result));
  } catch (error) {
    next(error);
  }
});

export default router;
