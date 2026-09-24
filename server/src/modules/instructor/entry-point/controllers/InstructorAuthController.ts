import { Request, Response } from 'express';
import { IRegisterInstructorUseCase } from '../../application/interfaces/IRegisterInstructorUseCase';
import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { ApiResponseHelper } from '../../../../shared/utils/ApiResponseHelper';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { IReapplyInstructorUseCase } from '../../application/interfaces/IReapplyInstructorUseCase';
import { TempInstructorData } from '../../../../shared/services/otp/interfaces/ITempInstructorData ';
import { TempStudentData } from '../../../../shared/services/otp/interfaces/ITempStudentData';
import {
  InstructorRegistrationRequestDto,
  InstructorVerifyOtpRequestDto,
  InstructorReapplyRequestDto,
} from '../../application/dtos/InstructorRequestDto';
import { IStorageService } from '../../../../shared/services/file-upload/interfaces/IStorageService';
import logger from '../../../../shared/utils/Logger';

/** Handles HTTP requests for instructor auth operations. */
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
   * Register instructor for the InstructorAuth entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
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

    const instructorEntity = {
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
      phoneNumber: dto.phoneNumber,
      subject: dto.subject.trim() === 'Other' ? dto.customSubject : dto.subject,
      jobTitle:
        dto.jobTitle.trim() === 'Other' ? dto.customJobTitle : dto.jobTitle,
      socialMediaLink: dto.socialMediaLink,
      experience: dto.experience,
      portfolioLink: dto.portfolioLink,
      bio: dto.bio,
      resumeKey, // plain S3 key, or undefined if upload failed/skipped
    };
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
   * Verify otp for the InstructorAuth entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const dto: InstructorVerifyOtpRequestDto = req.body;

    logger.info('[VerifyOtp] OTP verification attempt', { email: dto.email });

    await this._registerInstructorUseCase.execute(dto.email, dto.Otp);

    logger.info('[VerifyOtp] Instructor registered successfully', {
      email: dto.email,
    });
    ApiResponseHelper.created(
      res,
      "Successfully registered. You'll receive an email once approved.",
    );
  };

  /**
   * Reapply for the InstructorAuth entity.
   *
   * @param req - The Express request object.
   * @param res - The Express response object.
   */
  reapply = async (req: Request, res: Response): Promise<void> => {
    const dto: InstructorReapplyRequestDto = req.body;
    const file = req.file;

    await this._reapplyInstructorUseCase.execute(dto, file);
    ApiResponseHelper.success(res, 'Application re-submitted successfully');
  };
}
