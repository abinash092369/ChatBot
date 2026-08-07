import { prisma } from '../database/prisma.service.js';
import crypto from 'crypto';

export class AuthRepository {
  // Sessions
  public async createSession(data: { userId: string; token: string; ipAddress?: string; userAgent?: string; expiresAt: Date }) {
    return prisma.session.create({ data });
  }

  public async findSessionByToken(token: string) {
    return prisma.session.findUnique({
      where: { token },
      include: { user: { include: { role: true } } },
    });
  }

  public async revokeSession(sessionId: string) {
    return prisma.session.update({
      where: { id: sessionId },
      data: { isRevoked: true },
    });
  }

  public async revokeAllUserSessions(userId: string) {
    return prisma.session.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }

  // Refresh Tokens (Token Rotation)
  public async createRefreshToken(data: { userId: string; tokenHash: string; familyId: string; expiresAt: Date }) {
    return prisma.refreshToken.create({ data });
  }

  public async findRefreshTokenByHash(tokenHash: string) {
    return prisma.refreshToken.findUnique({
      where: { tokenHash },
    });
  }

  public async markRefreshTokenRotated(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { isRotated: true },
    });
  }

  public async revokeTokenFamily(familyId: string) {
    return prisma.refreshToken.updateMany({
      where: { familyId },
      data: { isRevoked: true },
    });
  }

  // OAuth Account
  public async findOAuthAccount(provider: string, providerAccountId: string) {
    return prisma.oAuthAccount.findUnique({
      where: { provider_providerAccountId: { provider, providerAccountId } },
      include: { user: { include: { role: true } } },
    });
  }

  public async linkOAuthAccount(data: { userId: string; provider: string; providerAccountId: string; accessToken?: string; refreshToken?: string }) {
    return prisma.oAuthAccount.create({ data });
  }

  // Verification & Password Reset
  public async createVerificationToken(userId: string, token: string, expiresAt: Date) {
    return prisma.verificationToken.create({
      data: { userId, token, expiresAt },
    });
  }

  public async findVerificationToken(token: string) {
    return prisma.verificationToken.findUnique({ where: { token } });
  }

  public async deleteVerificationToken(id: string) {
    return prisma.verificationToken.delete({ where: { id } });
  }

  public async createPasswordResetToken(userId: string, token: string, expiresAt: Date) {
    return prisma.passwordResetToken.create({
      data: { userId, token, expiresAt },
    });
  }

  public async findPasswordResetToken(token: string) {
    return prisma.passwordResetToken.findUnique({ where: { token } });
  }

  public async markPasswordResetTokenUsed(id: string) {
    return prisma.passwordResetToken.update({
      where: { id },
      data: { isUsed: true },
    });
  }
}

export const authRepository = new AuthRepository();
