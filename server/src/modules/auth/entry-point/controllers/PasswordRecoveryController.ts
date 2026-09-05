import { Request, Response } from 'express';
import { IResendOtpUseCase } from '../../application/interfaces/IResendOtpUseCase';
import { IForgotPasswordUseCase } from '../../application/interfaces/IForgotPasswordUseCase';
import { IResetPasswordUseCase } from '../../application/interfaces/IResetPasswordUseCase';
import logger from '../../../../shared/utils/Logger';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { ResendOtpRequestDto } from '../../application/dtos/ResendOtpRequestDto';
import { ForgotPasswordRequestDto } from '../../application/dtos/ForgotPasswordRequestDto';
import { ResetPasswordRequestDto } from '../../application/dtos/ResetPasswordRequestDto';

export class PasswordRecoveryController {
  constructor(
    private readonly _resendOtpUseCase: IResendOtpUseCase,
    private readonly _forgotPasswordUseCase: IForgotPasswordUseCase,
    private readonly _resetPasswordUseCase: IResetPasswordUseCase,
  ) {}

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
}
