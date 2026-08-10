import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util.js';
import { AppError } from './error.middleware.js';
import { prisma } from '../database/prisma.service.js';

export async function authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let token: string | undefined;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies?.accessToken) {
      token = req.cookies.accessToken;
    } else if (req.cookies?.token) {
      token = req.cookies.token;
    } else if (req.query?.token) {
      token = req.query.token as string;
    }

    if (!token) {
      throw new AppError('Unauthorized: Access token missing', 401, 'UNAUTHORIZED');
    }

    const decoded = verifyAccessToken(token);
    req.user = decoded;
    req.sessionId = decoded.sessionId;

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new AppError('Unauthorized: Access token expired', 401, 'TOKEN_EXPIRED'));
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      next(new AppError('Unauthorized: Invalid access token', 401, 'INVALID_TOKEN'));
      return;
    }
    next(error);
  }
}

export function authorizeRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Unauthorized', 401, 'UNAUTHORIZED'));
      return;
    }

    if (!allowedRoles.includes(req.user.roleName)) {
      next(new AppError('Forbidden: Insufficient role permissions', 403, 'FORBIDDEN'));
      return;
    }

    next();
  };
}

export function authorizePermission(action: string, resource: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401, 'UNAUTHORIZED');
      }

      // Admin has blanket permission
      if (req.user.roleName === 'ADMIN') {
        next();
        return;
      }

      const rolePermission = await prisma.rolePermission.findFirst({
        where: {
          roleId: req.user.roleId,
          permission: {
            action,
            resource,
          },
        },
      });

      if (!rolePermission) {
        throw new AppError(`Forbidden: Requires ${action} on ${resource}`, 403, 'FORBIDDEN');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}
