import bcrypt from 'bcryptjs';
import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { Instructor } from '../../domain/entities/Instructor';
import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { IRegisterInstructorUseCase } from '../interfaces/IRegisterInstructorUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { HttpError } from '../../../../shared/types/HttpError';
import { InstructorRegistrationSchema } from '../../../../shared/validations/AuthValidation';
import { jobQueueService } from '../../../../shared/services/job-queue/JobQueueService';
import { JOB_NAMES, QUEUE_NAMES, ResumeUploadJobData } from '../../../../shared/services/job-queue/JobTypes';

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
    if (responseLength !== 11) {
      throw new HttpError("Some data's are missing", HttpStatusCode.BAD_REQUEST);
    }

    // Validate the registration data using Zod schema
    const validationResult = InstructorRegistrationSchema.safeParse(dto);
    if (!validationResult.success) {
      throw new HttpError(validationResult.error.issues.map((e) => e.message).join(', '), HttpStatusCode.BAD_REQUEST);
    }

    const hashedPassword = await bcrypt.hash(validationResult.data.password, 10);
    console.log('Password hashed successfully');
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
      validationResult.data.phoneNumber || null,
      null, // resumeUrl - will be set asynchronously
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

    const savedInstructor = await this.instructorRepo.save(instructor);

    // Queue resume upload if file exists
    if (dto.resumeFile) {
      const resumeUploadData: ResumeUploadJobData = {
        instructorId: savedInstructor.instructorId || '',
        filePath: dto.resumeFile.path,
        originalName: dto.resumeFile.originalname,
        email: validationResult.data.email,
      };

      await jobQueueService.addJob(
        QUEUE_NAMES.INSTRUCTOR_REGISTRATION,
        JOB_NAMES.RESUME_UPLOAD,
        resumeUploadData
      );

    }
  }
}
