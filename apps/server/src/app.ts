import express, { Express, Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.config.js';
import { globalRateLimiter } from './middlewares/rate-limiter.middleware.js';
import { globalErrorHandler } from './middlewares/error.middleware.js';
import routes from './routes/index.js';
import { initializeTools } from './modules/tools/index.js';
import { createApiResponse } from '@chatbot/utils';

export function createApp(): Express {
  const app = express();

  // Initialize Tool Registry Ecosystem
  initializeTools();

  // 1. Security & Headers
  app.use(helmet());
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(null, true); // Allow during production deployment matching
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  // 2. Parsers & Logger
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser(env.COOKIE_SECRET));
  if (env.NODE_ENV !== 'test') {
    app.use(
      morgan('dev', {
        skip: (req) => req.url?.includes('/health') || req.url?.includes('/favicon.ico'),
      }),
    );
  }

  // 3. Global Rate Limiter
  app.use('/api', globalRateLimiter);

  // 4. API Routes
  app.use('/api/v1', routes);

  // 5. Base Root Route
  app.get('/', (req: Request, res: Response) => {
    res.json(
      createApiResponse(true, 'AI Assistant Platform Backend API v1', {
        environment: env.NODE_ENV,
        status: 'online',
        timestamp: new Date().toISOString(),
      }),
    );
  });

  // 6. 404 Fallback
  app.use((req: Request, res: Response) => {
    res.status(404).json(
      createApiResponse(false, `Route ${req.method} ${req.originalUrl} not found`, null, {
        code: 'NOT_FOUND',
        message: 'The requested resource was not found on this server',
      }),
    );
  });

  // 7. Global Exception Handler
  app.use(globalErrorHandler);

  return app;
}
