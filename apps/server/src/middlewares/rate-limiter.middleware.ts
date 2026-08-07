import rateLimit from 'express-rate-limit';
import { env } from '../config/env.config.js';
import { createApiResponse } from '@chatbot/utils';

export const globalRateLimiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: Number(env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: createApiResponse(false, 'Too many requests, please try again later.', null, {
    code: 'RATE_LIMIT_EXCEEDED',
    message: 'Rate limit exceeded',
  }),
});

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 mins for auth routes
  standardHeaders: true,
  legacyHeaders: false,
  message: createApiResponse(false, 'Too many authentication attempts, please try again after 15 minutes.', null, {
    code: 'AUTH_RATE_LIMIT_EXCEEDED',
    message: 'Authentication rate limit exceeded',
  }),
});
