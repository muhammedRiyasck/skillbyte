import { Request, Response } from 'express';
import { IRegisterStudentUseCase } from '../../application/interfaces/IRegisterStudentUseCase';
import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpError } from '../../../../shared/types/HttpError';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';

/**
 * Controller for student authentication operations.
 * Handles student registration and OTP verification.
 */
export class StudentAuthController {
  /**
   * Constructs the StudentAuthController.
   * @param registerStudentUseCase - Use case for registering students.
   * @param generateOtpUseCase - Service for OTP generation and verification.
   */
  constructor(
    private readonly _registerStudentUseCase: IRegisterStudentUseCase,
    private readonly _generateOtpUseCase: IOtpService,
  ) {}

  /**
   * Registers a new student by storing temporary data and sending OTP.
   * @param req - Express request object with student registration data.
   * @param res - Express response object.
   */
  registerStudent = async (req: Request, res: Response): Promise<void> => {
    const { fullName, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      throw new HttpError(ERROR_MESSAGES.CONFIMED_PASSWORD_MISMATCH, HttpStatusCode.BAD_REQUEST);
    }

    const isUserExists = await this._registerStudentUseCase.isUserExists(email);
    if (!isUserExists) {
      await this._generateOtpUseCase.storeTempData(email, { fullName, email, password });
      await this._generateOtpUseCase.sendOtp(email, fullName, 'student registration');
      ApiResponseHelper.created(res, 'An OTP sent to your mail.');
    } else {
      throw new HttpError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HttpStatusCode.BAD_REQUEST);
    }
  };

  /**
   * Verifies the OTP and completes student registration.
   * @param req - Express request object with OTP and email.
   * @param res - Express response object.
   */
  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { Otp, email } = req.body;
    await this._registerStudentUseCase.execute(email, Otp);
    ApiResponseHelper.created(res, 'Student Registration Successful.');
  };
}

