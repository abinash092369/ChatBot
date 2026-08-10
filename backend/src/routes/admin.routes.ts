import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorizeRole } from '../middlewares/auth.middleware.js';
import { createApiResponse } from '../utils/index.js';
import { prisma } from '../database/prisma.service.js';
import { hashPassword } from '../utils/bcrypt.util.js';

const router = Router();
router.use(authenticate);
router.use(authorizeRole('ADMIN'));

// Get System Analytics Metrics
router.get('/analytics', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [totalUsers, totalConversations, totalToolExecutions, totalSearches, usageLogs] = await Promise.all([
      prisma.user.count(),
      prisma.conversation.count({ where: { deletedAt: null } }),
      prisma.toolExecution.count(),
      prisma.searchHistory.count(),
      prisma.usageLog.findMany({ take: 20, orderBy: { createdAt: 'desc' } }),
    ]);

    res.status(200).json(
      createApiResponse(true, 'Admin analytics metrics retrieved', {
        metrics: {
          totalUsers,
          totalConversations,
          totalToolExecutions,
          totalSearches,
        },
        usageLogs,
      }),
    );
  } catch (error) {
    next(error);
  }
});

// List All Users with filters
router.get('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, role, page = '1', limit = '50' } = req.query;
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { email: { contains: search as string, mode: 'insensitive' } },
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (role) {
      whereClause.role = { name: role as string };
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          role: true,
          _count: {
            select: { conversations: true, knowledgeBases: true },
          },
        },
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const formattedItems = items.map((u) => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      avatarUrl: u.avatarUrl,
      isEmailVerified: u.isEmailVerified,
      isActive: u.isActive,
      roleId: u.roleId,
      role: u.role,
      conversationCount: u._count.conversations,
      knowledgeBaseCount: u._count.knowledgeBases,
      createdAt: u.createdAt.toISOString(),
      updatedAt: u.updatedAt.toISOString(),
    }));

    res.status(200).json(
      createApiResponse(true, 'Users list retrieved', {
        items: formattedItems,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }),
    );
  } catch (error) {
    next(error);
  }
});

// Create User by Admin
router.post('/users', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, firstName, lastName, roleName = 'USER' } = req.body;

    if (!email || !password) {
      res.status(400).json(createApiResponse(false, 'Email and password are required', null));
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(400).json(createApiResponse(false, 'User email already exists', null));
      return;
    }

    const targetRole = await prisma.role.findUnique({ where: { name: roleName } });
    if (!targetRole) {
      res.status(400).json(createApiResponse(false, `Role '${roleName}' not found`, null));
      return;
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        firstName,
        lastName,
        isEmailVerified: true,
        role: { connect: { id: targetRole.id } },
        userPreferences: { create: { theme: 'SYSTEM', emailNotifications: true } },
      },
      include: { role: true },
    });

    res.status(201).json(createApiResponse(true, 'User account created by Admin', user));
  } catch (error) {
    next(error);
  }
});

// Update User Role
router.put('/users/:id/role', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { roleName } = req.body;

    const targetRole = await prisma.role.findUnique({ where: { name: roleName } });
    if (!targetRole) {
      res.status(400).json(createApiResponse(false, `Role '${roleName}' not found`, null));
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { roleId: targetRole.id },
      include: { role: true },
    });

    res.status(200).json(createApiResponse(true, 'User role updated successfully', updatedUser));
  } catch (error) {
    next(error);
  }
});

// Toggle User Status (Active / Deactivated)
router.put('/users/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { isActive } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
      include: { role: true },
    });

    res.status(200).json(createApiResponse(true, `User status updated to ${isActive ? 'Active' : 'Deactivated'}`, updatedUser));
  } catch (error) {
    next(error);
  }
});

// Get System Settings
router.get('/settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await prisma.settings.findMany();
    res.status(200).json(createApiResponse(true, 'System settings retrieved', settings));
  } catch (error) {
    next(error);
  }
});

// Update System Setting
router.put('/settings', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { key, value, description } = req.body;
    const setting = await prisma.settings.upsert({
      where: { key },
      update: { value: String(value), description },
      create: { key, value: String(value), description },
    });
    res.status(200).json(createApiResponse(true, 'Setting saved', setting));
  } catch (error) {
    next(error);
  }
});

export default router;
