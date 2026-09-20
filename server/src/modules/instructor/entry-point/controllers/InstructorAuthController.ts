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
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import logger from '../../../../shared/utils/Logger';

/**
 * Controller for instructor authentication operations.
 * Handles instructor registration and OTP verification.
 */
export class InstructorAuthController {
  /**
   * Constructs the InstructorAuthController.
   * @param _registerInstructorUseCase - Use case for registering instructors.
   * @param _generateOtpUseCase - Service for OTP generation and verification.
   * @param _reapplyInstructorUseCase - Use case for re-applying.
   * @param _storageService - Storage service for direct S3 uploads.
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
   * Registers a new instructor.
   *
   * The resume upload completes before temporary registration data is stored.
   * This guarantees OTP verification cannot create an instructor without the
   * required resume key.
   */
  registerInstructor = async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw new HttpError(
        "We can't see your resume",
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const dto: InstructorRegistrationRequestDto = req.body;

    logger.info('[Register] Incoming registration', {
      email: dto.email,
      fileName: req.file.originalname,
      fileMime: req.file.mimetype,
      fileSizeBytes: req.file.size,
    });

    const isUserExists = await this._registerInstructorUseCase.isUserExists(
      dto.email,
    );
    if (isUserExists) {
      throw new HttpError(
        ERROR_MESSAGES.EMAIL_ALREADY_EXISTS,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    logger.info('[Register:upload] Starting resume upload', {
      email: dto.email,
      originalName: req.file.originalname,
      sizeBytes: req.file.size,
    });
    const resumeKey = await this._storageService.uploadBuffer(
      req.file.buffer,
      req.file.originalname,
      {
        folder: 'instructor-resumes',
        contentType: req.file.mimetype,
      },
    );

    const instructorEntity = InstructorMapper.toRegisterInstructorEntity(
      dto,
      resumeKey,
    );
    await this._generateOtpUseCase.storeTempData(dto.email, instructorEntity);
    logger.info('[Register] Temp data stored with resume key', {
      email: dto.email,
      resumeKey,
    });

    await this._generateOtpUseCase.sendOtp(
      dto.email,
      dto.fullName,
      'Instructor Registration OTP',
    );

    logger.info('[Register] OTP sent, response returned', { email: dto.email });
    ApiResponseHelper.created(res, 'An OTP sent to your mail.');
  };

  /**
   * Verifies the OTP and completes instructor registration.
   */
  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const dto: InstructorVerifyOtpRequestDto = req.body;
    const { email, otp } = InstructorMapper.toVerifyOtpEntity(dto);

    logger.info('[VerifyOtp] OTP verification attempt', { email });

    await this._registerInstructorUseCase.execute(email, otp);

    logger.info('[VerifyOtp] Instructor registered successfully', { email });
    ApiResponseHelper.created(
      res,
      "Successfully registered. You'll receive an email once approved.",
    );
  };

  /**
   * Re-applies a rejected instructor application.
   */
  reapply = async (req: Request, res: Response): Promise<void> => {
    const dto: InstructorReapplyRequestDto = req.body;
    const file = req.file;
    const { email, updates } = InstructorMapper.toReapplyEntity(dto);

    await this._reapplyInstructorUseCase.execute(email, updates, file);
    ApiResponseHelper.success(res, 'Application re-submitted successfully');
  };
}
