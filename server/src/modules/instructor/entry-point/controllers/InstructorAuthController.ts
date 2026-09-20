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
   * Upload flow (fire-and-forget):
   *   1. multer puts the file in memory (no disk write).
   *   2. We fire the S3 upload immediately — the response is NOT awaited.
   *      The upload finishes in the background while the user waits for OTP.
   *   3. On success the resolved S3 key is patched into the Redis temp data.
   *   4. If the upload fails the key is left undefined; registration still
   *      succeeds but the instructor will have no resume.
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

    // Store temp data without resume key first so OTP can be sent right away
    const instructorEntity = InstructorMapper.toRegisterInstructorEntity(dto);
    await this._generateOtpUseCase.storeTempData(dto.email, instructorEntity);

    logger.info('[Register] Temp data stored in Redis (no resume key yet)', {
      email: dto.email,
    });

    // ── Fire-and-forget S3 upload ──────────────────────────────────────────
    // We deliberately do NOT await this. The OTP is sent immediately and the
    // upload resolves in the background (typically <2 s for a PDF).
    // On completion the Redis entry is patched with the S3 key so that by the
    // time the user enters their OTP it is already available.
    void (async () => {
      try {
        logger.info('[Register:upload] Starting S3 upload', {
          email: dto.email,
          originalName: req.file!.originalname,
          sizeBytes: req.file!.size,
        });

        const resumeKey = await this._storageService.uploadBuffer(
          req.file!.buffer,
          req.file!.originalname,
          {
            folder: 'instructor-resumes',
            contentType: req.file!.mimetype,
          },
        );

        logger.info('[Register:upload] S3 upload succeeded', {
          email: dto.email,
          resumeKey,
        });

        // Patch the already-stored temp data with the resolved key
        const existing = (await this._generateOtpUseCase.getTempData(
          dto.email,
        )) as TempInstructorData | null;

        if (existing) {
          await this._generateOtpUseCase.storeTempData(dto.email, {
            ...existing,
            resumeKey,
          });
          logger.info('[Register:upload] Redis temp data patched with resumeKey', {
            email: dto.email,
            resumeKey,
          });
        } else {
          // Temp data expired before upload finished (very unlikely in <2 s)
          logger.warn(
            '[Register:upload] Temp data expired before resume key could be patched',
            { email: dto.email },
          );
        }
      } catch (err) {
        // Upload failed — log it, but do NOT crash the registration.
        // The instructor will simply have no resume URL after verification.
        logger.error('[Register:upload] S3 upload FAILED (non-blocking)', {
          email: dto.email,
          error: (err as Error)?.message,
        });
      }
    })();
    // ──────────────────────────────────────────────────────────────────────

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
