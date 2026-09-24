import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

import { generateAccessToken } from '../../../../shared/utils/AccessToken';
import { generateRefreshToken } from '../../../../shared/utils/RefreshToken';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/** Handles HTTP requests for facebook operations. */
export class facebookController {
  /**
   * Facebook auth for the facebook entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function.
   */
  static facebookAuth(req: Request, res: Response, next: NextFunction) {
    const { role } = req.query;
    passport.authenticate('facebook', {
      scope: ['email', 'profile'],
      state: JSON.stringify({ role }),
    })(req, res, next);
  }

  /**
   * Facebook callback for the facebook entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function.
   */
  static facebookCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      'google',
      { failureRedirect: '/login', session: false },
      (err, user, info) => {
        if (err || !user) {
          return res
            .status(400)
            .json({ error: info?.message || 'Authentication failed' });
        }

        const { id, role } = user;
        const accessToken = generateAccessToken({ id, role });
        const refreshToken = generateRefreshToken({ id, role });

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

        res.status(HttpStatusCode.OK).json({
          message: `${role} login successful via Facebook`,
          user: {
            name: user.name,
            email: user.email,
            role,
            profilePicture: user.profilePictureUrl ?? null,
          },
        });
      },
    )(req, res, next);
  }
}
