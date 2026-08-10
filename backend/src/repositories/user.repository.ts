import { prisma } from '../database/prisma.service.js';
import { User, Prisma } from '@prisma/client';

export class UserRepository {
  public async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
        userPreferences: true,
      },
    });
  }

  public async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        role: true,
        userPreferences: true,
      },
    });
  }

  public async create(data: Prisma.UserCreateInput) {
    return prisma.user.create({
      data,
      include: {
        role: true,
        userPreferences: true,
      },
    });
  }

  public async update(id: string, data: Prisma.UserUpdateInput) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        role: true,
        userPreferences: true,
      },
    });
  }

  public async findRoleByName(name: string) {
    return prisma.role.findUnique({
      where: { name },
    });
  }
}

export const userRepository = new UserRepository();
