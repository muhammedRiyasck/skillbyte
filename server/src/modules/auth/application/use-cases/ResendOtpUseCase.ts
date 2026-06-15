import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { IOtpRateLimiter } from '../../../../shared/services/otp/interfaces/IOtpRateLimiter';
import { IResendOtpUseCase } from '../interfaces/IResendOtpUseCase';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { TempInstructorData } from '../../../../shared/services/otp/interfaces/ITempInstructorData ';
import { TempStudentData } from '../../../../shared/services/otp/interfaces/ITempStudentData';

import { ResendOtpRequestDto } from '../dtos/ResendOtpRequestDto';

export class ResendOtpUseCase implements IResendOtpUseCase {
  constructor(
    private _otpService: IOtpService<TempInstructorData | TempStudentData>,
    private _rateLimiter: IOtpRateLimiter,
  ) {}

  /**
   * Executes the resend OTP process.
   * @param dto - The resend OTP request DTO.
   * @throws {HttpError} If the email is invalid, no data is found, or rate limiting is in effect.
   */
  async execute(dto: ResendOtpRequestDto): Promise<void> {
    const { email } = dto;
    if (!email) {
      throw new HttpError('Email is required', HttpStatusCode.BAD_REQUEST);
    }

    const tempData = await this._otpService.getTempData(email);
    if (!tempData) {
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
