import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { Instructor } from '../../domain/entities/Instructor';
import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { IRegisterInstructorUseCase } from '../interfaces/IRegisterInstructorUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { TempInstructorData } from '../../../../shared/services/otp/interfaces/ITempInstructorData ';
import { InstructorAccountStatus } from '../../../../shared/enums/InstructorAccountStatus';
import { IPasswordHasher } from '../../../../shared/services/password-hasher/IPasswordHasher';
import { passwordHasher } from '../../../../shared/services/password-hasher/BcryptPasswordHasher';
import logger from '../../../../shared/utils/Logger';

/**
 * Use case for registering a new instructor.
 * Verifies OTP, validates data, and creates a new instructor account.
 *
 * Resume flow:
 *   The controller uploads the file to S3 as a fire-and-forget operation and
 *   patches the Redis temp data with the resolved S3 key.
 *   This use case simply reads that key and persists it on the instructor
 *   document — no background job or event bus required.
 */
export class RegisterInstructorUseCase implements IRegisterInstructorUseCase {
  /**
   * @param _instructorRepo - The instructor repository for data operations.
   * @param _otpService     - The OTP service for verification.
   * @param _passwordHasher - Abstraction for password hashing.
   */
  constructor(
    private readonly _instructorRepo: IInstructorRepository,
    private readonly _otpService: IOtpService<TempInstructorData>,
    private readonly _passwordHasher: IPasswordHasher = passwordHasher,
  ) {}

  /** Returns true if an instructor with this email already exists. */
  async isUserExists(email: string): Promise<boolean> {
    const instructor = await this._instructorRepo.findByEmail(email);
    return !!instructor;
  }

  /**
   * Verifies OTP, builds the Instructor entity (with resumeKey from Redis),
   * and persists it to the database.
   */
  async execute(email: string, otp: string): Promise<void> {
    logger.info('[RegisterUseCase] execute() called', { email });

    // ── 1. Read temp data from Redis ───────────────────────────────────────
    const dto = await this._otpService.getTempData(email);
    if (!dto) {
      logger.error('[RegisterUseCase] No temp data found in Redis', { email });
      throw new HttpError(
        ERROR_MESSAGES.NO_CURRENT_DATA,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }

    logger.info('[RegisterUseCase] Temp data retrieved from Redis', {
      email,
      hasResumeKey: !!(dto as TempInstructorData).resumeKey,
      resumeKey: (dto as TempInstructorData).resumeKey ?? 'none',
    });

    // ── 2. Verify OTP ──────────────────────────────────────────────────────
    const valid = await this._otpService.verifyOtp(email, otp);
    if (!valid) {
      logger.warn('[RegisterUseCase] Invalid OTP provided', { email });
      throw new HttpError(
        ERROR_MESSAGES.INVALID_OTP,
        HttpStatusCode.BAD_REQUEST,
      );
    }
    logger.info('[RegisterUseCase] OTP verified successfully', { email });

    // ── 3. Resolve resume key ──────────────────────────────────────────────
    const resumeKey = (dto as TempInstructorData).resumeKey ?? null;

    if (!resumeKey) {
      logger.warn(
        '[RegisterUseCase] resumeKey is missing — instructor saved WITHOUT resume. ' +
          'Possible causes: S3 upload failed, or upload did not finish before OTP was entered.',
        { email },
      );
    } else {
      logger.info('[RegisterUseCase] resumeKey present, will be set on instructor', {
        email,
        resumeKey,
      });
    }

    // ── 4. Build and save instructor ───────────────────────────────────────
    const hashedPassword = await this._passwordHasher.hash(dto.password);
    const instructor = new Instructor(
      dto.fullName,
      dto.email,
      hashedPassword,
      dto.subject,
      dto.jobTitle,
      Number(dto.experience),
      dto.socialMediaLink || '',
      dto.portfolioLink || '',
      dto.bio,
      dto.phoneNumber || null,
      resumeKey,                        // S3 key from fire-and-forget upload
      null,                             // profilePictureUrl
      true,                             // isEmailVerified
      InstructorAccountStatus.PENDING,  // accountStatus
      false,                            // not approved
      null,                             // approvalNotes
      false,                            // not rejected
      null,                             // rejectedNote
      null,                             // doneBy
      null,                             // doneAt
      0,                                // avg rating
      0,                                // total reviews
      0,                                // total earnings
      0,                                // withdrawn amount
      null,                             // stripeAccountId
      false,                            // isStripeVerified
    );

    const savedInstructor = await this._instructorRepo.save(instructor);

    logger.info('[RegisterUseCase] Instructor saved to DB successfully', {
      email,
      instructorId: savedInstructor.instructorId,
      resumeUrl: savedInstructor.resumeUrl ?? 'null',
    });
  }
}
