import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { updateProfileSchema, updatePreferencesSchema } from '../validators/user.validator.js';

const router = Router();

router.use(authenticate);

router.get('/me', (req, res, next) => userController.getMe(req, res, next));
router.put('/me', validateBody(updateProfileSchema), (req, res, next) => userController.updateMe(req, res, next));
router.put('/preferences', validateBody(updatePreferencesSchema), (req, res, next) => userController.updatePreferences(req, res, next));
router.get('/analytics', (req, res, next) => userController.getAnalytics(req, res, next));

export default router;
