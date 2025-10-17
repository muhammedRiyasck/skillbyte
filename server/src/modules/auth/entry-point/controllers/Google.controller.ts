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
    console.log(1)
  }

  static googleCallback(req: Request, res: Response,next: NextFunction) {
    console.log(2);
    passport.authenticate(
      'google',
      { failureRedirect: '/auth/'},
      (err, userr, info) => {
        if (err || !userr) {
          const errorMessage = err?.message || info?.message || 'Authentication failed';
          return res.redirect(`${process.env.SUCCESS_REDIRECT!}/?error=${encodeURIComponent(errorMessage)}`);
        }
          console.log(5)
          const { user, role } = userr;
          req.user = user
          const accessToken = generateAccessToken({ id: user.studentId, role });
          const refreshToken = generateRefreshToken({ id: user.studentId, role });
          res.cookie('access_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000, // 15 minutes
          });

          res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
          });

          res.status(302).redirect(`${process.env.SUCCESS_REDIRECT!}/oauth-success`);
        
      },
    )(req, res , next);
  }
}
