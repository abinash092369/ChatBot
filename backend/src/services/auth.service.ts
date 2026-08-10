import crypto from 'crypto';
import { userRepository } from '../repositories/user.repository.js';
import { authRepository } from '../repositories/auth.repository.js';
import { auditRepository } from '../repositories/audit.repository.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.util.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.util.js';
import { AppError } from '../middlewares/error.middleware.js';

export class AuthService {
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public async register(data: { email: string; password: string; firstName?: string; lastName?: string }, ipAddress?: string, userAgent?: string) {
    const existingUser = await userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new AppError('Email address is already registered', 400, 'USER_EXISTS');
    }

    const defaultRole = await userRepository.findRoleByName('USER');
    if (!defaultRole) {
      throw new AppError('Default user role not found in system', 500, 'ROLE_NOT_FOUND');
    }

    const passwordHash = await hashPassword(data.password);

    const user = await userRepository.create({
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: { connect: { id: defaultRole.id } },
      userPreferences: {
        create: {
          theme: 'SYSTEM',
          emailNotifications: true,
        },
      },
    });

    // Create session & tokens
    const familyId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();

    const payload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      sessionId,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const tokenHash = this.hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await authRepository.createSession({ userId: user.id, token: sessionId, ipAddress, userAgent, expiresAt });
    await authRepository.createRefreshToken({ userId: user.id, tokenHash, familyId, expiresAt });

    // Generate Verification Token
    const verifyToken = crypto.randomBytes(32).toString('hex');
    await authRepository.createVerificationToken(user.id, verifyToken, new Date(Date.now() + 24 * 60 * 60 * 1000));

    await auditRepository.createLog({
      userId: user.id,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        roleId: user.roleId,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900, // 15 mins
      },
      verificationToken: verifyToken,
    };
  }

  public async login(data: { email: string; password: string; rememberMe?: boolean }, ipAddress?: string, userAgent?: string) {
    const user = await userRepository.findByEmail(data.email);
    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated', 403, 'ACCOUNT_DEACTIVATED');
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    const familyId = crypto.randomUUID();
    const sessionId = crypto.randomUUID();

    const payload = {
      userId: user.id,
      email: user.email,
      roleId: user.roleId,
      roleName: user.role.name,
      sessionId,
    };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);
    const tokenHash = this.hashToken(refreshToken);

    const expiresAt = new Date(Date.now() + (data.rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000);
    await authRepository.createSession({ userId: user.id, token: sessionId, ipAddress, userAgent, expiresAt });
    await authRepository.createRefreshToken({ userId: user.id, tokenHash, familyId, expiresAt });

    await auditRepository.createLog({
      userId: user.id,
      action: 'USER_LOGIN',
      entity: 'User',
      entityId: user.id,
      ipAddress,
      userAgent,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl,
        isEmailVerified: user.isEmailVerified,
        isActive: user.isActive,
        roleId: user.roleId,
        role: user.role,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      tokens: {
        accessToken,
        refreshToken,
        expiresIn: 900,
      },
    };
  }

  public async refreshToken(incomingRefreshToken: string, ipAddress?: string, userAgent?: string) {
    try {
      const decoded = verifyRefreshToken(incomingRefreshToken);
      const incomingHash = this.hashToken(incomingRefreshToken);

      const existingToken = await authRepository.findRefreshTokenByHash(incomingHash);
      if (!existingToken) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
      }

      // Security check: Token Reuse Detection
      if (existingToken.isRotated || existingToken.isRevoked) {
        // Potential theft! Revoke token family
        await authRepository.revokeTokenFamily(existingToken.familyId);
        await auditRepository.createLog({
          userId: decoded.userId,
          action: 'REFRESH_TOKEN_REUSE_DETECTED',
          entity: 'RefreshToken',
          details: { familyId: existingToken.familyId },
          ipAddress,
          userAgent,
        });
        throw new AppError('Security Alert: Refresh token reuse detected. All sessions revoked.', 401, 'TOKEN_REUSE_DETECTED');
      }

      // Mark current token as rotated
      await authRepository.markRefreshTokenRotated(existingToken.id);

      // Issue new token pair in same family
      const user = await userRepository.findById(decoded.userId);
      if (!user || !user.isActive) {
        throw new AppError('User inactive or not found', 401, 'USER_INACTIVE');
      }

      const payload = {
        userId: user.id,
        email: user.email,
        roleId: user.roleId,
        roleName: user.role.name,
        sessionId: decoded.sessionId,
      };

      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);
      const newTokenHash = this.hashToken(newRefreshToken);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await authRepository.createRefreshToken({
        userId: user.id,
        tokenHash: newTokenHash,
        familyId: existingToken.familyId,
        expiresAt,
      });

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: 900,
      };
    } catch (err: any) {
      if (err instanceof AppError) throw err;
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }
  }

  public async logout(userId: string, sessionId?: string, ipAddress?: string, userAgent?: string) {
    if (sessionId) {
      await authRepository.revokeSession(sessionId);
    }
    await auditRepository.createLog({
      userId,
      action: 'USER_LOGOUT',
      entity: 'User',
      entityId: userId,
      ipAddress,
      userAgent,
    });
  }

  public async verifyEmail(token: string) {
    const record = await authRepository.findVerificationToken(token);
    if (!record || record.expiresAt < new Date()) {
      throw new AppError('Invalid or expired verification token', 400, 'INVALID_TOKEN');
    }

    await userRepository.update(record.userId, { isEmailVerified: true });
    await authRepository.deleteVerificationToken(record.id);

    return { message: 'Email address verified successfully' };
  }

  public async requestPasswordReset(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Return success to prevent email enumeration
      return { message: 'If an account exists, a password reset link has been generated' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await authRepository.createPasswordResetToken(user.id, resetToken, expiresAt);

    return {
      message: 'Password reset link generated successfully',
      resetToken, // Returned for dev testing
    };
  }

  public async confirmPasswordReset(token: string, newPassword: string) {
    const record = await authRepository.findPasswordResetToken(token);
    if (!record || record.isUsed || record.expiresAt < new Date()) {
      throw new AppError('Invalid or expired password reset token', 400, 'INVALID_TOKEN');
    }

    const passwordHash = await hashPassword(newPassword);
    await userRepository.update(record.userId, { passwordHash });
    await authRepository.markPasswordResetTokenUsed(record.id);
    await authRepository.revokeAllUserSessions(record.userId);

    return { message: 'Password reset completed successfully. Please log in with your new password.' };
  }
}

export const authService = new AuthService();
