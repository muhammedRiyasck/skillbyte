import { Request, Response } from 'express';
import { IRegisterInstructorUseCase } from '../../application/interfaces/IRegisterInstructorUseCase';
import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { IReapplyInstructorUseCase } from '../../application/interfaces/IReapplyInstructorUseCase';
import { InstructorRegistrationSchema, InstructorVerifyOtpSchema, InstructorReapplySchema } from '../../application/dtos/InstructorDtos';
import { InstructorMapper } from '../../application/mappers/InstructorMapper';

/**
 * Controller for instructor authentication operations.
 * Handles instructor registration and OTP verification.
 */
export class InstructorAuthController {
  /**
   * Constructs the InstructorAuthController.
   * @param _registerInstructorUseCase - Use case for registering instructors.
   * @param _generateOtpUseCase - Service for OTP generation and verification.
   */
  constructor(
    private readonly _registerInstructorUseCase: IRegisterInstructorUseCase,
    private readonly _generateOtpUseCase: IOtpService,
    private readonly _reapplyInstructorUseCase: IReapplyInstructorUseCase,

  ) {}

  /**
   * Registers a new instructor by storing temporary data and sending OTP.
   * @param req - Express request object with instructor registration data.
   * @param res - Express response object.
   */
  registerInstructor = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new HttpError("We can't see your resume", HttpStatusCode.BAD_REQUEST);
    }
    
    // Parse and validate body
    const validatedData = InstructorRegistrationSchema.parse(req.body);
    
    // Check if user exists
    const isUserExists = await this._registerInstructorUseCase.isUserExists(validatedData.email);
    if(isUserExists)  throw new HttpError(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS, HttpStatusCode.BAD_REQUEST);

    // Map to entity
    const instructorEntity = InstructorMapper.toRegisterInstructorEntity(validatedData, req.file);

    await this._generateOtpUseCase.storeTempData(validatedData.email, instructorEntity);
    await this._generateOtpUseCase.sendOtp(validatedData.email, validatedData.fullName, 'Instructor Registration OTP');
    ApiResponseHelper.created(res, 'An OTP sent to your mail.');
  };

  /**
   * Verifies the OTP and completes instructor registration.
   * @param req - Express request object with OTP and email.
   * @param res - Express response object.
   */
  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const validatedData = InstructorVerifyOtpSchema.parse(req.body);
    const { email, otp } = InstructorMapper.toVerifyOtpEntity(validatedData);
    await this._registerInstructorUseCase.execute(email, otp);
    ApiResponseHelper.created(res, "Successfully registered. You'll receive an email once approved.");
  };

   /**
   * Re-applies a rejected instructor application.
   * @param req - Authenticated request object with update data and optional resume file.
   * @param res - Express response object.
   */
  reapply = async (req: Request, res: Response): Promise<void> => {
    const validatedData = InstructorReapplySchema.parse(req.body);
    const file = req.file;
    const { email, updates } = InstructorMapper.toReapplyEntity(validatedData);
    
    await this._reapplyInstructorUseCase.execute(email, updates, file);
    ApiResponseHelper.success(res, 'Application re-submitted successfully');
  };
}
