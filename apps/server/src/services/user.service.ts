import { userRepository } from '../repositories/user.repository.js';
import { prisma } from '../database/prisma.service.js';
import { AppError } from '../middlewares/error.middleware.js';

export class UserService {
  public async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      isEmailVerified: user.isEmailVerified,
      isActive: user.isActive,
      roleId: user.roleId,
      role: user.role,
      userPreferences: user.userPreferences,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  public async updateProfile(userId: string, data: { firstName?: string; lastName?: string; avatarUrl?: string | null }) {
    const user = await userRepository.update(userId, data);
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl,
      updatedAt: user.updatedAt.toISOString(),
    };
  }

  public async updatePreferences(userId: string, data: { theme?: 'LIGHT' | 'DARK' | 'SYSTEM'; emailNotifications?: boolean; twoFactorEnabled?: boolean }) {
    const updated = await prisma.userPreferences.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        theme: data.theme || 'SYSTEM',
        emailNotifications: data.emailNotifications ?? true,
        twoFactorEnabled: data.twoFactorEnabled ?? false,
      },
    });

    return updated;
  }
}

export const userService = new UserService();
