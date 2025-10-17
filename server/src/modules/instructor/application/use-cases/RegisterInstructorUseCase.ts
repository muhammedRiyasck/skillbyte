import bcrypt from 'bcryptjs';
import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { Instructor } from '../../domain/entities/Instructor';
import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { IRegisterInstructorUseCase } from '../interfaces/IRegisterInstructorUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import { InstructorRegistrationSchema } from '../../../../shared/validations/AuthValidation';

/**
 * Use case for registering a new instructor.
 * Verifies OTP, validates data, and creates a new instructor account.
 */
export class RegisterInstructorUseCase implements IRegisterInstructorUseCase {
  /**
   * Constructs the RegisterInstructorUseCase.
   * @param instructorRepo - The instructor repository for data operations.
   * @param otpService - The OTP service for verification.
   */
  constructor(
    private readonly instructorRepo: IInstructorRepository,
    private readonly otpService: IOtpService,
  ) {}

  /**
   * Checks if an instructor with the given email already exists.
   * @param email - The email address to check.
   * @returns A promise that resolves to true if the instructor exists, false otherwise.
   */
  async isUserExists(email: string): Promise<boolean> {
    const instructor = await this.instructorRepo.findByEmail(email);
    return instructor ? true : false;
  }

  /**
   * Executes the instructor registration process.
   * Retrieves temporary data, verifies OTP, validates data completeness, and saves the new instructor.
   * @param email - The email address of the instructor.
   * @param otp - The OTP for verification.
   * @throws HttpError with appropriate status code if registration fails.
   */
  async execute(email: string, otp: string): Promise<void> {
    const dto = await this.otpService.getTempData(email);
    if (!dto) {
      throw new HttpError('No data found or Your Current Data Expired', HttpStatusCode.INTERNAL_SERVER_ERROR);
    }

    const valid = await this.otpService.verifyOtp(email, otp);
    if (!valid) {
      throw new HttpError('Invalid or expired OTP', HttpStatusCode.BAD_REQUEST);
    }

    const responseLength = Object.entries(dto).length;
    if (responseLength !== 8) {
      throw new HttpError("Some data's are missing", HttpStatusCode.BAD_REQUEST);
    }

    // Validate the registration data using Zod schema
    const validationResult = InstructorRegistrationSchema.safeParse(dto);
    if (!validationResult.success) {
      throw new HttpError(validationResult.error.issues.map((e) => e.message).join(', '), HttpStatusCode.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(validationResult.data.password, 10);

    const instructor = new Instructor(
      validationResult.data.fullName,
      validationResult.data.email,
      hashedPassword,
      validationResult.data.subject,
      validationResult.data.jobTitle,
      Number(validationResult.data.experience),
      validationResult.data.socialMediaLink || '',
      validationResult.data.portfolio || '',
      validationResult.data.bio,
      validationResult.data.profilePictureUrl || null,
      true, // isEmailVerified
      'pending', // accountStatus
      false, // not approved
      null, // approvalNotes
      false, // not rejected
      null, // rejectedNote
      null, // approvedBy
      null, // approvedAt
      0, // avg rating
      0, // total reviews
    );

    await this.instructorRepo.save(instructor);
  }
}
