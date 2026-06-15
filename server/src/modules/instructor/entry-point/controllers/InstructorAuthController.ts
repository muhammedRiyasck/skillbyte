import { Request, Response } from 'express';
import { IRegisterInstructorUseCase } from '../../application/interfaces/IRegisterInstructorUseCase';
import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { IReapplyInstructorUseCase } from '../../application/interfaces/IReapplyInstructorUseCase';
import { InstructorMapper } from '../../application/mappers/InstructorMapper';
import { TempInstructorData } from '../../../../shared/services/otp/interfaces/ITempInstructorData ';
import { TempStudentData } from '../../../../shared/services/otp/interfaces/ITempStudentData';
import {
  InstructorRegistrationRequestDto,
  InstructorVerifyOtpRequestDto,
  InstructorReapplyRequestDto,
} from '../../application/dtos/InstructorRequestDto';

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
    private readonly _generateOtpUseCase: IOtpService<
      TempInstructorData | TempStudentData
    >,
    private readonly _reapplyInstructorUseCase: IReapplyInstructorUseCase,
  ) {}

  /**
   * Registers a new instructor by storing temporary data and sending OTP.
   * @param req - Express request object with instructor registration data.
   * @param res - Express response object.
   */
  registerInstructor = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new HttpError(
        "We can't see your resume",
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const dto: InstructorRegistrationRequestDto = req.body;

    const isUserExists = await this._registerInstructorUseCase.isUserExists(
      dto.email,
    );
    if (isUserExists)
      throw new HttpError(
        ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        HttpStatusCode.BAD_REQUEST,
      );

    const instructorEntity = InstructorMapper.toRegisterInstructorEntity(
      dto,
      req.file,
    );

    await this._generateOtpUseCase.storeTempData(dto.email, instructorEntity);
    await this._generateOtpUseCase.sendOtp(
      dto.email,
      dto.fullName,
      'Instructor Registration OTP',
    );
    ApiResponseHelper.created(res, 'An OTP sent to your mail.');
  };

  /**
   * Verifies the OTP and completes instructor registration.
   * @param req - Express request object with OTP and email.
   * @param res - Express response object.
   */
  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const dto: InstructorVerifyOtpRequestDto = req.body;
    const { email, otp } = InstructorMapper.toVerifyOtpEntity(dto);
    await this._registerInstructorUseCase.execute(email, otp);
    ApiResponseHelper.created(
      res,
      "Successfully registered. You'll receive an email once approved.",
    );
  };

  /**
   * Re-applies a rejected instructor application.
   * @param req - Authenticated request object with update data and optional resume file.
   * @param res - Express response object.
   */
  reapply = async (req: Request, res: Response): Promise<void> => {
    const dto: InstructorReapplyRequestDto = req.body;
    const file = req.file;
    const { email, updates } = InstructorMapper.toReapplyEntity(dto);

    await this._reapplyInstructorUseCase.execute(email, updates, file);
    ApiResponseHelper.success(res, 'Application re-submitted successfully');
  };
}
