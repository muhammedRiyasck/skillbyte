import passport from 'passport';

import { Request, Response, NextFunction } from 'express';
import { generateAccessToken } from '../../../../shared/utils/AccessToken';
import { generateRefreshToken } from '../../../../shared/utils/RefreshToken';
export class GoogleController {
  static googleAuth(req: Request, res: Response, next: NextFunction) {
    const state = JSON.stringify({ role: req.query.role || 'student' });
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      state: state,
    })(req, res, next);
  }

  static googleCallback(req: any, res: any) {
    passport.authenticate(
      'google',
      { failureRedirect: '/login', session: false },
      (err, user, info) => {
        if (err || !user) {
          return res
            .status(400)
            .json({ error: info.message || 'Authentication failed' });
        }
        async (req: any, res: Response) => {
          const { user, role } = req.user;

          const accessToken = generateAccessToken({ id: user._id, role });
          const refreshToken = generateRefreshToken({ id: user._id, role });
          res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000,
          });

          res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });

          res.status(200).json({
            message: `${role} login successful via Google`,
            user: {
              name: user.name,
              email: user.email,
              role,
              profilePicture: user.profilePictureUrl ?? null,
            },
          });
        };
      },
    )(req, res);
  }
}
