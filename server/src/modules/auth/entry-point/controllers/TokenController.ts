import { Request, Response } from 'express';
import { IAccessTokenUseCase } from '../../application/interfaces/IAccessTokenUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import logger from '../../../../shared/utils/Logger';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';

export class TokenController {
  constructor(private readonly _accessTokenUseCase: IAccessTokenUseCase) {}

  refreshToken = (req: Request, res: Response): void => {
    logger.info(`Refresh token attempt from IP: ${req.ip}`);
    const refreshToken = req.cookies.refresh_token;

    if (!refreshToken) {
      logger.warn('Refresh token missing');
      throw new HttpError(
        ERROR_MESSAGES.NO_REFRESH_TOKEN_PROVIDED,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    const newAccessToken = this._accessTokenUseCase.execute(refreshToken);

    res.cookie('access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Number(process.env.ACCESS_TOKEN_MAX_AGE),
    });

    logger.info('Access token refreshed successfully');
    ApiResponseHelper.success(res, 'Access token refreshed');
  };
}
