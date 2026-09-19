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

/**
 * Use case for registering a new instructor.
 * Verifies OTP, validates data, and creates a new instructor account.
 */
export class RegisterInstructorUseCase implements IRegisterInstructorUseCase {
  /**
   * Constructs the RegisterInstructorUseCase.
   * @param _instructorRepo - The instructor repository for data operations.
   * @param otpService - The OTP service for verification.
   * @param _passwordHasher - Abstraction for password hashing.
   */
  constructor(
    private readonly _instructorRepo: IInstructorRepository,
    private readonly _otpService: IOtpService<TempInstructorData>,
    private readonly _passwordHasher: IPasswordHasher = passwordHasher,
  ) {}

  /**
   * Checks if an instructor with the given email already exists.
   * @param email - The email address to check.
   * @returns A promise that resolves to true if the instructor exists, false otherwise.
   */
  async isUserExists(email: string): Promise<boolean> {
    const instructor = await this._instructorRepo.findByEmail(email);
    return instructor ? true : false;
  }

  /**
   * Executes the instructor registration process.
   * Retrieves temporary data, verifies OTP, validates data completeness, and saves the new instructor.
   * The resumeKey (S3 key) was pre-uploaded directly by the client using a pre-signed URL.
   * @param email - The email address of the instructor.
   * @param otp - The OTP for verification.
   * @param resumeKey - The S3 key where the resume was uploaded (validated by the controller).
   * @throws HttpError with appropriate status code if registration fails.
   */
  async execute(email: string, otp: string, resumeKey?: string): Promise<void> {
    const dto = await this._otpService.getTempData(email);
    if (!dto) {
      throw new HttpError(
        ERROR_MESSAGES.NO_CURRENT_DATA,
        HttpStatusCode.INTERNAL_SERVER_ERROR,
      );
    }
    const valid = await this._otpService.verifyOtp(email, otp);
    if (!valid) {
      throw new HttpError(
        ERROR_MESSAGES.INVALID_OTP,
        HttpStatusCode.BAD_REQUEST,
      );
    }

    // Use the resumeKey passed from the controller (already validated to exist in S3)
    // Fall back to tempResumeKey stored in Redis (in case of race conditions)
    const resolvedResumeKey = resumeKey || dto.tempResumeKey || null;

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
      resolvedResumeKey, // S3 key — uploaded directly by client via pre-signed URL
      null, // profilePictureUrl
      true, // isEmailVerified
      InstructorAccountStatus.PENDING, // accountStatus
      false, // not approved
      null, // approvalNotes
      false, // not rejected
      null, // rejectedNote
      null, // doneBy
      null, // doneAt
      0, // avg rating
      0, // total reviews
      0, // total earnings
      0, // withdrawn amount
      null, // stripeAccountId
      false, // isStripeVerified
    );

    await this._instructorRepo.save(instructor);
  }
}
