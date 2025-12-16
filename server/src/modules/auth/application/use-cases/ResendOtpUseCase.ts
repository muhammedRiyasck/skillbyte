import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { OtpRateLimiter } from '../../../../shared/services/otp/OtpRateLimiter';
import { IResendOtpUseCase } from '../interfaces/IResendOtpUseCase';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/**
 * Use case for resending OTP to a user's email.
 * This class handles the logic for resending OTP with rate limiting to prevent abuse.
 */
export class ResendOtpUseCase implements IResendOtpUseCase {
  /**
   * Creates an instance of ResendOtpUseCase.
   * @param otpService - The OTP service for handling OTP operations.
   * @param rateLimiter - The rate limiter for controlling OTP resend frequency.
   */
  constructor(
    private _otpService: IOtpService,
    private _rateLimiter: OtpRateLimiter,
  ) {}

  /**
   * Executes the resend OTP process.
   * @param email - The email address to resend the OTP to.
   * @throws {HttpError} If the email is invalid, no data is found, or rate limiting is in effect.
   */
  async execute(email: string): Promise<void> {
    if (!email) {
      throw new HttpError('Email is required', HttpStatusCode.BAD_REQUEST);
    }

    const dto = await this._otpService.getTempData(email);
    if (!dto) {
      throw new HttpError(
        'No data found or your current data has expired',
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const ttl = await this._rateLimiter.isBlocked(email);
    if (ttl) {
      throw new HttpError(
        `Please wait ${ttl} seconds before resending OTP`,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    await this._otpService.sendOtp(email, '', '🔁 Resend OTP - SkillByte');
    await this._rateLimiter.block(email, 60); // Block for 1 minute
  }
}
