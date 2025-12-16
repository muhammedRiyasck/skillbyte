import { ILoginAdminUseCase } from '../../application/interfaces/ILoginAdminUseCase';
import { Request, Response } from 'express';
import { LoginAdminSchema } from '../../../../shared/validations/AdminValidation';
import logger from '../../../../shared/utils/Logger';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';

/**
 * Controller for admin authentication.
 * Handles admin login operations with standardized responses.
 */
export class AdminAuthController {
  /**
   * Constructs the AdminAuthController.
   * @param loginAdminUseCase - Use case for admin login.
   */
  constructor(private readonly _loginAdminUseCase: ILoginAdminUseCase) {}

  /**
   * Handles admin login.
   * Validates input, authenticates admin, and sets authentication cookies.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  login = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Admin login attempt from IP: ${req.ip}`);

    const validationResult = LoginAdminSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.warn(
        `Admin login validation failed: ${validationResult.error.message}`,
      );
      throw new HttpError(
        ERROR_MESSAGES.INVALID_INPUT,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const { email, password } = validationResult.data;

    const data = await this._loginAdminUseCase.execute({ email, password });
    const { admin, accessToken, refreshToken } = data;

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

    logger.info(`Admin login successful for email: ${email}`);

    const userData = {
      name: admin.name,
      email: admin.email,
      role: 'admin',
      profilePicture: admin.profilePictureUrl,
    };

    ApiResponseHelper.success(res, 'Admin Login Successful', userData);
  };
}
