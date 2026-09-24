import passport from 'passport';

import { Request, Response, NextFunction } from 'express';
import { generateAccessToken } from '../../../../shared/utils/AccessToken';
import { generateRefreshToken } from '../../../../shared/utils/RefreshToken';
/** Handles HTTP requests for google operations. */
export class GoogleController {
  /**
   * Google auth for the Google entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function.
   */
  static googleAuth(req: Request, res: Response, next: NextFunction) {
    const state = JSON.stringify({ role: req.query.role || 'student' });
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: state,
    })(req, res, next);
  }

  /**
   * Google callback for the Google entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function.
   */
  static googleCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      'google',
      { failureRedirect: '/auth/' },
      (
        err: Error | null,
        userr:
          | {
              user: { studentId: string; name: string; email: string };
              role: string;
            }
          | false,
        info: { message?: string } | undefined,
      ) => {
        if (err || !userr) {
          const errorMessage =
            err?.message || info?.message || 'Authentication failed';
          return res.redirect(
            `${process.env.SUCCESS_REDIRECT!}/?error=${encodeURIComponent(errorMessage)}`,
          );
        }

        const { user, role } = userr;
        req.user = user;
        const accessToken = generateAccessToken({ id: user.studentId, role });
        const refreshToken = generateRefreshToken({ id: user.studentId, role });
        res.cookie('access_token', accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE),
        });

        res.cookie('refresh_token', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict',
          maxAge: Number(process.env.REFRESH_TOKEN_MAX_AGE),
        });

        res
          .status(302)
          .redirect(`${process.env.SUCCESS_REDIRECT!}/oauth-success`);
      },
    )(req, res, next);
  }
}
