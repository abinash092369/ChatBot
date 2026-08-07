import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validateBody } from '../middlewares/validate.middleware.js';
import { authRateLimiter } from '../middlewares/rate-limiter.middleware.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { registerSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema } from '../validators/auth.validator.js';

const router = Router();

router.post('/register', authRateLimiter, validateBody(registerSchema), (req, res, next) => authController.register(req, res, next));
router.post('/login', authRateLimiter, validateBody(loginSchema), (req, res, next) => authController.login(req, res, next));
router.post('/refresh', (req, res, next) => authController.refreshToken(req, res, next));
router.post('/logout', authenticate, (req, res, next) => authController.logout(req, res, next));
router.post('/verify-email', validateBody(verifyEmailSchema), (req, res, next) => authController.verifyEmail(req, res, next));
router.post('/forgot-password', authRateLimiter, validateBody(forgotPasswordSchema), (req, res, next) => authController.forgotPassword(req, res, next));
router.post('/reset-password', validateBody(resetPasswordSchema), (req, res, next) => authController.resetPassword(req, res, next));

export default router;
