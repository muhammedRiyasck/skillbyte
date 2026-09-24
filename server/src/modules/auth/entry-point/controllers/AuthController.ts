import { Request, Response } from 'express';
import { IAmILoggedInUseCase } from '../../application/interfaces/IAmILoggedInUseCase';
import { ILoginStudentUseCase } from '../../../student/application/interfaces/ILoginStudentUseCase';
import { ILoginInstructorUseCase } from '../../../instructor/application/interfaces/ILoginInstructorUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import logger from '../../../../shared/utils/Logger';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { UserRole } from '../../../../shared/enums/UserRole';
import { AuthResponseDto } from '../../application/dtos/AuthResponseDto';
import { LoginRequestDto } from '../../application/dtos/LoginRequestDto';

/** Handles HTTP requests for auth operations. */
export class AuthController {
  constructor(
    private readonly _studentLoginUC: ILoginStudentUseCase,
    private readonly _instructorLoginUC: ILoginInstructorUseCase,
    private readonly _amILoggedInUseCase: IAmILoggedInUseCase,
  ) {}

  /**
   * Am i logged in for the Auth entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  amILoggedIn = async (req: Request, res: Response): Promise<void> => {
    logger.info(`AmILoggedIn check from IP: ${req.ip}`);
    const decodedUserData = req.user as { id: string; role: UserRole };
    const authResponse = await this._amILoggedInUseCase.execute(
      decodedUserData.id,
      decodedUserData.role,
    );
    logger.info(`User logged in status: ${authResponse ? true : false}`);

    if (!authResponse) {
      ApiResponseHelper.unauthorized(res, 'User not found');
      return;
    }

    ApiResponseHelper.success(res, 'User is logged in', authResponse);
  };

  /**
   * Login for the Auth entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  login = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Login attempt from IP: ${req.ip}`);
    const dto: LoginRequestDto = req.body;
    const { email, role } = dto;

    let authResponse: AuthResponseDto;
    let accessToken: string;
    let refreshToken: string;

    switch (role) {
      case UserRole.STUDENT: {
        const data = await this._studentLoginUC.execute(dto);
        authResponse = data.user;
        accessToken = data.accessToken;
        refreshToken = data.refreshToken;
        break;
      }
      case UserRole.INSTRUCTOR: {
        const data = await this._instructorLoginUC.execute(dto);
        authResponse = data.user;
        accessToken = data.accessToken;
        refreshToken = data.refreshToken;
        break;
      }
      default:
        logger.warn(`Invalid role attempted: ${role}`);
        throw new HttpError(
          ERROR_MESSAGES.INVALID_INPUT,
          HttpStatusCode.BAD_REQUEST,
        );
    }

    if (authResponse.userData.accountStatus !== 'rejected') {
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
    }
    logger.info(`Login successful for ${role}: ${email}`);
    ApiResponseHelper.success(res, 'Login successful', authResponse);
  };

  /**
   * Logout for the Auth entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  logout = (req: Request, res: Response): void => {
    logger.info(`Logout attempt from IP: ${req.ip}`);

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    logger.info('User logged out successfully');
    ApiResponseHelper.success(res, 'Logout successful');
  };
}
