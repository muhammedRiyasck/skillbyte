import { ILoginAdminUseCase } from '../../application/interfaces/ILoginAdminUseCase';
import { Request, Response } from 'express';
import { LoginAdminRequestDto } from '../../application/dtos/AdminRequestDto';
import logger from '../../../../shared/utils/Logger';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';

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

    const dto: LoginAdminRequestDto = req.body;

    const data = await this._loginAdminUseCase.execute(dto);
    const { admin, accessToken, refreshToken } = data;

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

    logger.info(`Admin login successful for email: ${dto.email}`);

    ApiResponseHelper.success(res, 'Admin Login Successful', admin);
  };
}
