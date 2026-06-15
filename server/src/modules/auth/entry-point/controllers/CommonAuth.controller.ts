import { Request, Response } from 'express';
import { IAccessTokenUseCase } from '../../application/interfaces/IAccessTokenUseCase';
import { IResendOtpUseCase } from '../../application/interfaces/IResendOtpUseCase';
import { IForgotPasswordUseCase } from '../../application/interfaces/IForgotPasswordUseCase';
import { IResetPasswordUseCase } from '../../application/interfaces/IResetPasswordUseCase';
import { IAmILoggedInUseCase } from '../../application/interfaces/IAmILoggedInUseCase';
import { ILoginStudentUseCase } from '../../../student/application/interfaces/ILoginStudentUseCase';
import { ILoginInstructorUseCase } from '../../../instructor/application/interfaces/ILoginInstructorUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import logger from '../../../../shared/utils/Logger';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { AuthMapper } from '../../application/mappers/AuthMapper';
import { UserRole } from '../../../../shared/enums/UserRole';
import { AuthResponseDto } from '../../application/dtos/AuthResponseDto';
import { LoginRequestDto } from '../../application/dtos/LoginRequestDto';
import { ResendOtpRequestDto } from '../../application/dtos/ResendOtpRequestDto';
import { ForgotPasswordRequestDto } from '../../application/dtos/ForgotPasswordRequestDto';
import { ResetPasswordRequestDto } from '../../application/dtos/ResetPasswordRequestDto';

export class CommonAuthController {
  constructor(
    private readonly _studentLoginUC: ILoginStudentUseCase,
    private readonly _instructorLoginUC: ILoginInstructorUseCase,
    private readonly _accessTokenUseCase: IAccessTokenUseCase,
    private readonly _resendOtpUseCase: IResendOtpUseCase,
    private readonly _forgotPasswordUseCase: IForgotPasswordUseCase,
    private readonly _resetPasswordUseCase: IResetPasswordUseCase,
    private readonly _amILoggedInUseCase: IAmILoggedInUseCase,
  ) {}

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
        authResponse = AuthMapper.toAuthResponseDto(data.user, role);
        accessToken = data.accessToken;
        refreshToken = data.refreshToken;
        break;
      }
      case UserRole.INSTRUCTOR: {
        const data = await this._instructorLoginUC.execute(dto);
        authResponse = AuthMapper.toAuthResponseDto(data.user, role);
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

  resendOtp = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Resend OTP attempt from IP: ${req.ip}`);
    const dto: ResendOtpRequestDto = req.body;

    await this._resendOtpUseCase.execute(dto);
    logger.info(`OTP resent successfully to: ${dto.email}`);
    ApiResponseHelper.success(res, 'OTP resent successfully');
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Forgot password attempt from IP: ${req.ip}`);
    const dto: ForgotPasswordRequestDto = req.body;

    const user = await this._forgotPasswordUseCase.execute(dto);
    if (user === false) {
      logger.info(`Non-existent user delay for email: ${dto.email}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    } else {
      logger.info(
        `Forgot password link sent to: ${dto.email} for role: ${dto.role}`,
      );
    }
    ApiResponseHelper.success(
      res,
      'If the email exists, a reset link has been sent.',
    );
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Reset password attempt from IP: ${req.ip}`);
    const dto: ResetPasswordRequestDto = req.body;

    await this._resetPasswordUseCase.execute(dto);
    logger.info(`Password reset successful for role: ${dto.role}`);
    ApiResponseHelper.success(res, 'Password reset successfully');
  };

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
