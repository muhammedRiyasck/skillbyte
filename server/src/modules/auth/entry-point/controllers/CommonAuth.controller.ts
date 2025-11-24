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
import { LoginSchema, ResendOtpSchema, ForgotPasswordSchema, ResetPasswordSchema } from '../../../../shared/validations/AuthValidation';
import logger from '../../../../shared/utils/Logger';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';

export class CommonAuthController {
  constructor(
    private readonly _studentLoginUC: ILoginStudentUseCase,
    private readonly _instructorLoginUC: ILoginInstructorUseCase,
    private readonly _accessTokenUseCase: IAccessTokenUseCase,
    private readonly _resendOtpUseCase: IResendOtpUseCase,
    private readonly _forgotPasswordUseCase : IForgotPasswordUseCase,
    private readonly _resetPasswordUseCase : IResetPasswordUseCase,
    private readonly _amILoggedInUseCase : IAmILoggedInUseCase
  ) {}

  /**
   * Checks if the user is logged in.
   * @param req - Authenticated request object.
   * @param res - Express response object.
   */
  amILoggedIn = async (req: Request, res: Response): Promise<void> => {
    logger.info(`AmILoggedIn check from IP: ${req.ip}`);
    const decodedUserData = req.user as { id: string; role: string };
    const user = await this._amILoggedInUseCase.execute(decodedUserData.id, decodedUserData.role);
    logger.info(`User logged in status: ${user ? true : false}`);
    ApiResponseHelper.success(res, 'User is logged in', {
      userData: {
        name: user?.name,
        email: user?.email,
        profilePicture: user?.profilePictureUrl,
        role: decodedUserData.role
      }
    });
  };

  /**
   * Handles user login for students and instructors.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  login = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Login attempt from IP: ${req.ip}`);

    const validationResult = LoginSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.warn(`Login validation failed: ${validationResult.error.message}`);
      throw new HttpError(ERROR_MESSAGES.INVALID_INPUT, HttpStatusCode.BAD_REQUEST);
    }

    const { email, password, role } = validationResult.data;

    let data;

    switch (role) {
      case 'student':
        data = await this._studentLoginUC.execute(email, password);
        break;
      case 'instructor':
        data = await this._instructorLoginUC.execute(email, password);
        break;
      default:
        logger.warn(`Invalid role attempted: ${role}`);
        throw new HttpError(ERROR_MESSAGES.INVALID_INPUT, HttpStatusCode.BAD_REQUEST);
    }
    const { user, accessToken, refreshToken } = data;

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

    logger.info(`Login successful for ${role}: ${email}`);

    ApiResponseHelper.success(res, 'Login successful', {
      userData: {
        name: user.name,
        email: user.email,
        role,
        profilePicture: user.profilePictureUrl
      },
    });
  };

  /**
   * Refreshes the access token using the refresh token.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  refreshToken = (req: Request, res: Response): void => {
    logger.info(`Refresh token attempt from IP: ${req.ip}`);

    const refreshToken = req.cookies.refresh_token;
    if (!refreshToken) {
      logger.warn('Refresh token missing');
      throw new HttpError(ERROR_MESSAGES.NO_REFRESH_TOKEN_PROVIDED, HttpStatusCode.UNAUTHORIZED);
    }

    const newAccessToken = this._accessTokenUseCase.execute(refreshToken);

    res.cookie("access_token", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000 // 15 min
    });

    logger.info('Access token refreshed successfully');
    ApiResponseHelper.success(res, "Access token refreshed");
  };


  /**
   * Resends OTP to the user's email.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  resendOtp = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Resend OTP attempt from IP: ${req.ip}`);

    const validationResult = ResendOtpSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.warn(`Resend OTP validation failed: ${validationResult.error.message}`);
      throw new HttpError(ERROR_MESSAGES.INVALID_INPUT, HttpStatusCode.BAD_REQUEST);
    }

    const { email } = validationResult.data;

    await this._resendOtpUseCase.execute(email);
    logger.info(`OTP resent successfully to: ${email}`);
    ApiResponseHelper.success(res, "OTP resent successfully");
  };

  /**
   * Handles forgot password request by sending reset link.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Forgot password attempt from IP: ${req.ip}`);

    const validationResult = ForgotPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.warn(`Forgot password validation failed: ${validationResult.error.message}`);
      throw new HttpError(ERROR_MESSAGES.INVALID_INPUT, HttpStatusCode.BAD_REQUEST);
    }

    const { email, role } = validationResult.data;

    const user = await this._forgotPasswordUseCase.execute(email, role);
    // Delay to prevent timing attacks
    if (user === false) {
      logger.info(`Non-existent user delay for email: ${email}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    } else {
      logger.info(`Forgot password link sent to: ${email} for role: ${role}`);
    }
    ApiResponseHelper.success(res, 'If the email exists, a reset link has been sent.');
  };

  /**
   * Resets the user's password using a reset token.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  resetPassword = async (req: Request, res: Response): Promise<void> => {
    logger.info(`Reset password attempt from IP: ${req.ip}`);

    const validationResult = ResetPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      logger.warn(`Reset password validation failed: ${validationResult.error.message}`);
      throw new HttpError(ERROR_MESSAGES.INVALID_INPUT, HttpStatusCode.BAD_REQUEST);
    }

    const { token, password, role } = validationResult.data;

    await this._resetPasswordUseCase.execute(token, password, role);
    logger.info(`Password reset successful for role: ${role}`);
    ApiResponseHelper.success(res, 'Password reset successfully');
  };


  /**
   * Logs out the user by clearing authentication cookies.
   * @param req - Express request object.
   * @param res - Express response object.
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
