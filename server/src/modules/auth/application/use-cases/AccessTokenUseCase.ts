import jwt from 'jsonwebtoken';

import { generateAccessToken } from '../../../../shared/utils/AccessToken';
import { IAccessTokenUseCase } from '../interfaces/IAccessTokenUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import logger from '../../../../shared/utils/Logger';
import { HttpError } from '../../../../shared/types/HttpError';

/** Executes the business logic for access token. */
export class AccessTokenUseCase implements IAccessTokenUseCase {
  /**
   * Execute for the AccessToken entity.
   *
   * @param refreshToken - The refresh token information.
   * @returns The result of the operation.
   */
  execute(refreshToken: string): string {
    if (!refreshToken) {
      throw new HttpError(
        ERROR_MESSAGES.NO_REFRESH_TOKEN_PROVIDED,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    if (!process.env.JWT_REFRESH_SECRET) {
      throw new HttpError(
        'JWT_REFRESH_SECRET is not configured',
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
    ) as {
      id: string;
      role: string;
    };

    logger.info(
      `Access token refreshed for user ID: ${decoded.id}, role: ${decoded.role}`,
    );

    const accessToken = generateAccessToken({
      id: decoded.id,
      role: decoded.role,
    });

    return accessToken;
  }
}
