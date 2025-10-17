import { Request, Response } from 'express';
import { IRegisterInstructorUseCase } from '../../application/interfaces/IRegisterInstructorUseCase';
import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/**
 * Controller for instructor authentication operations.
 * Handles instructor registration and OTP verification.
 */
export class InstructorAuthController {
  /**
   * Constructs the InstructorAuthController.
   * @param registerInstructorUseCase - Use case for registering instructors.
   * @param generateOtpUseCase - Service for OTP generation and verification.
   */
  constructor(
    private readonly registerInstructorUseCase: IRegisterInstructorUseCase,
    private readonly generateOtpUseCase: IOtpService,
  ) {}

  /**
   * Registers a new instructor by storing temporary data and sending OTP.
   * @param req - Express request object with instructor registration data.
   * @param res - Express response object.
   */
  registerInstructor = async (req: Request, res: Response): Promise<void> => {
    let {
      fullName,
      email,
      password,
      subject,
      jobTitle,
      socialMediaLink,
      experience,
      portfolioLink,
      customJobTitle,
      customSubject,
    } = req.body;

    // Handle custom subject and job title
    subject = subject.trim() === 'Other' ? customSubject : subject;
    jobTitle = jobTitle.trim() === 'Other' ? customJobTitle : jobTitle;

    const isUserExists = await this.registerInstructorUseCase.isUserExists(email);

    if (!isUserExists) {
      await this.generateOtpUseCase.storeTempData(email, {
        fullName,
        email,
        password,
        subject,
        jobTitle,
        socialMediaLink,
        experience,
        portfolioLink,
      });
      await this.generateOtpUseCase.sendOtp(email, fullName, 'Instructor Registration OTP');
      ApiResponseHelper.created(res, 'An OTP sent to your mail.');
    } else {
      throw new HttpError('Email already exists', HttpStatusCode.BAD_REQUEST);
    }
  };

  /**
   * Verifies the OTP and completes instructor registration.
   * @param req - Express request object with OTP and email.
   * @param res - Express response object.
   */
  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const { Otp, email } = req.body;
    await this.registerInstructorUseCase.execute(email, Otp);
    ApiResponseHelper.created(res, "Successfully registered. You'll receive an email once approved.");
  };
}
