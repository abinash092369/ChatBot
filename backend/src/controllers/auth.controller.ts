import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie, REFRESH_TOKEN_COOKIE_NAME } from '../utils/cookie.util.js';
import { createApiResponse } from '../utils/index.js';

export class AuthController {
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.register(req.body, req.ip, req.headers['user-agent']);
      setRefreshTokenCookie(res, result.tokens.refreshToken);

      res.status(201).json(
        createApiResponse(true, 'Registration successful', {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body, req.ip, req.headers['user-agent']);
      setRefreshTokenCookie(res, result.tokens.refreshToken);

      res.status(200).json(
        createApiResponse(true, 'Login successful', {
          user: result.user,
          accessToken: result.tokens.accessToken,
          expiresIn: result.tokens.expiresIn,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const incomingRefreshToken = req.cookies[REFRESH_TOKEN_COOKIE_NAME] || req.body.refreshToken;
      if (!incomingRefreshToken) {
        res.status(401).json(
          createApiResponse(false, 'Refresh token missing', null, {
            code: 'REFRESH_TOKEN_MISSING',
            message: 'Refresh token cookie or body missing',
          }),
        );
        return;
      }

      const result = await authService.refreshToken(incomingRefreshToken, req.ip, req.headers['user-agent']);
      setRefreshTokenCookie(res, result.refreshToken);

      res.status(200).json(
        createApiResponse(true, 'Token refreshed successfully', {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
        }),
      );
    } catch (error) {
      next(error);
    }
  }

  public async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (req.user) {
        await authService.logout(req.user.userId, req.sessionId, req.ip, req.headers['user-agent']);
      }
      clearRefreshTokenCookie(res);

      res.status(200).json(createApiResponse(true, 'Logged out successfully', null));
    } catch (error) {
      next(error);
    }
  }

  public async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.body;
      const result = await authService.verifyEmail(token);
      res.status(200).json(createApiResponse(true, result.message, null));
    } catch (error) {
      next(error);
    }
  }

  public async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);
      res.status(200).json(createApiResponse(true, result.message, { resetToken: result.resetToken }));
    } catch (error) {
      next(error);
    }
  }

  public async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.confirmPasswordReset(token, newPassword);
      res.status(200).json(createApiResponse(true, result.message, null));
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
