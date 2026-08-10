import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { setRefreshTokenCookie, clearRefreshTokenCookie, REFRESH_TOKEN_COOKIE_NAME } from '../utils/cookie.util.js';
import { createApiResponse } from '../utils/index.js';
import { env } from '../config/env.config.js';

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

  public async googleRedirect(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const clientId = env.GOOGLE_CLIENT_ID;
      const callbackUrl = (env.GOOGLE_CALLBACK_URL && !env.GOOGLE_CALLBACK_URL.includes('localhost'))
        ? env.GOOGLE_CALLBACK_URL
        : 'https://chatbot-m2lx.onrender.com/api/v1/auth/google/callback';

      if (!clientId) {
        res.status(500).json(createApiResponse(false, 'Google OAuth Client ID is not configured', null));
        return;
      }
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(callbackUrl)}&response_type=code&scope=${encodeURIComponent('openid profile email')}&access_type=offline&prompt=consent`;
      res.redirect(googleAuthUrl);
    } catch (error) {
      next(error);
    }
  }

  public async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const code = req.query.code as string;
      const webUrl = (env.WEB_URL && !env.WEB_URL.includes('localhost'))
        ? env.WEB_URL
        : 'https://abhi-ai-platform-psi.vercel.app';

      if (!code) {
        res.redirect(`${webUrl}/login?error=google_auth_failed`);
        return;
      }

      const result = await authService.handleGoogleCallback(code, req.ip, req.headers['user-agent']);
      setRefreshTokenCookie(res, result.tokens.refreshToken);

      res.redirect(`${webUrl}/auth/callback?token=${encodeURIComponent(result.tokens.accessToken)}`);
    } catch (error) {
      const webUrl = (env.WEB_URL && !env.WEB_URL.includes('localhost'))
        ? env.WEB_URL
        : 'https://abhi-ai-platform-psi.vercel.app';
      res.redirect(`${webUrl}/login?error=google_oauth_error`);
    }
  }
}

export const authController = new AuthController();
