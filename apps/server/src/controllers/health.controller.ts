import { Request, Response } from 'express';
import { prisma } from '../database/prisma.service.js';
import { redisService } from '../services/redis.service.js';
import { createApiResponse } from '@chatbot/utils';

export async function healthCheck(req: Request, res: Response): Promise<void> {
  let dbStatus = 'healthy';
  let redisStatus = 'healthy';

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = 'unhealthy';
  }

  try {
    await redisService.set('health_check', 'ok', 5);
    const val = await redisService.get('health_check');
    if (val !== 'ok') redisStatus = 'degraded';
  } catch {
    redisStatus = 'unhealthy';
  }

  const isHealthy = dbStatus === 'healthy';

  res.status(isHealthy ? 200 : 503).json(
    createApiResponse(isHealthy, `System is ${isHealthy ? 'healthy' : 'unhealthy'}`, {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    }),
  );
}
