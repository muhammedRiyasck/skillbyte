import { Request, Response } from 'express';
import { IRegisterStudentUseCase } from '../../application/interfaces/IRegisterStudentUseCase';
import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpError } from '../../../../shared/types/HttpError';

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
    private readonly registerStudentUseCase: IRegisterStudentUseCase,
    private readonly generateOtpUseCase: IOtpService,
  ) {}

  /**
   * Registers a new student by storing temporary data and sending OTP.
   * @param req - Express request object with student registration data.
   * @param res - Express response object.
   */
  registerStudent = async (req: Request, res: Response): Promise<void> => {
    const { fullName, email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
      throw new HttpError('Confirm Password Mismatched', HttpStatusCode.BAD_REQUEST);
    }

    const isUserExists = await this.registerStudentUseCase.isUserExists(email);
    if (!isUserExists) {
      await this.generateOtpUseCase.storeTempData(email, { fullName, email, password });
      await this.generateOtpUseCase.sendOtp(email, fullName, 'student registration');
      ApiResponseHelper.created(res, 'An OTP sent to your mail.');
    } else {
      throw new HttpError('Email already exists', HttpStatusCode.BAD_REQUEST);
    }
  };

  /**
   * Verifies the OTP and completes student registration.
   * @param req - Express request object with OTP and email.
   * @param res - Express response object.
   */
  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { Otp, email } = req.body;
    await this.registerStudentUseCase.execute(email, Otp);
    ApiResponseHelper.created(res, 'Student Registration Successful.');
  };
}

