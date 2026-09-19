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
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import {
  InstructorRegistrationRequestDto,
  InstructorVerifyOtpRequestDto,
  InstructorReapplyRequestDto,
} from '../../application/dtos/InstructorRequestDto';
import crypto from 'crypto';

/**
 * Controller for instructor authentication operations.
 * Handles instructor registration and OTP verification.
 */
export class InstructorAuthController {
  /**
   * Constructs the InstructorAuthController.
   * @param _registerInstructorUseCase - Use case for registering instructors.
   * @param _generateOtpUseCase - Service for OTP generation and verification.
   * @param _reapplyInstructorUseCase - Use case for re-applying instructors.
   * @param _storageService - Storage service for generating pre-signed upload URLs.
   */
  constructor(
    private readonly _registerInstructorUseCase: IRegisterInstructorUseCase,
    private readonly _generateOtpUseCase: IOtpService<
      TempInstructorData | TempStudentData
    >,
    private readonly _reapplyInstructorUseCase: IReapplyInstructorUseCase,
    private readonly _storageService: IStorageService,
  ) {}

  /**
   * Registers a new instructor by storing temporary data and sending OTP.
   * Also generates a write-only pre-signed S3 URL so the client can upload
   * the resume directly to S3 — no file data ever touches this server.
   * @param req - Express request object with instructor registration data (JSON, no file).
   * @param res - Express response object.
   */
  registerInstructor = async (req: Request, res: Response): Promise<void> => {
    const dto: InstructorRegistrationRequestDto = req.body;

    const isUserExists = await this._registerInstructorUseCase.isUserExists(
      dto.email,
    );
    if (isUserExists)
      throw new HttpError(
        ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        HttpStatusCode.BAD_REQUEST,
      );

    // Generate a unique S3 key with a UUID — not guessable
    // The pre-signed URL is write-only (PUT) and expires in 6 minutes
    const resumeKey = `temp-resumes/${crypto.randomUUID()}-resume`;
    const { signedUrl: uploadUrl } =
      await this._storageService.generateUploadUrl(
        resumeKey,
        dto.resumeContentType,
      );

    // Store ONLY the key (short string) in Redis — no binary data
    const instructorEntity = InstructorMapper.toRegisterInstructorEntity(
      dto,
      resumeKey,
    );

    await this._generateOtpUseCase.storeTempData(dto.email, instructorEntity);
    await this._generateOtpUseCase.sendOtp(
      dto.email,
      dto.fullName,
      'Instructor Registration OTP',
    );

    // Return the pre-signed URL to the client for direct S3 upload
    res.status(201).json({
      success: true,
      message: 'An OTP sent to your mail.',
      data: { uploadUrl, resumeKey },
    });
  };

  /**
   * Verifies the OTP and completes instructor registration.
   * Confirms the resume file actually exists in S3 before creating the account.
   * @param req - Express request object with OTP, email, and resumeKey.
   * @param res - Express response object.
   */
  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const dto: InstructorVerifyOtpRequestDto = req.body;
    const { email, otp } = InstructorMapper.toVerifyOtpEntity(dto);

    // Validate the resume was actually uploaded before confirming registration
    if (dto.resumeKey) {
      const resumeUploaded = await this._storageService.fileExists(dto.resumeKey);
      if (!resumeUploaded) {
        throw new HttpError(
          'Resume upload incomplete. Please try registering again.',
          HttpStatusCode.BAD_REQUEST,
        );
      }
    }

    await this._registerInstructorUseCase.execute(email, otp, dto.resumeKey);
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
