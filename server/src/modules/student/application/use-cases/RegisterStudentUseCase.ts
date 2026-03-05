import bcrypt from 'bcryptjs';
import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IOtpService } from '../../../../shared/services/otp/interfaces/IOtpService';
import { TempInstructorData } from '../../../../shared/services/otp/interfaces/ITempInstructorData ';
import { TempStudentData } from '../../../../shared/services/otp/interfaces/ITempStudentData';
import { Student } from '../../domain/entities/Student';
import { IRegisterStudentUseCase } from '../interfaces/IRegisterStudentUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { StudentRegistrationSchema } from '../../../../shared/validations/StudentValidation';

export class RegisterStudentUseCase implements IRegisterStudentUseCase {
  constructor(
    private _studentRepo: IStudentRepository,
    private readonly _otpService: IOtpService<
      TempInstructorData | TempStudentData
    >,
  ) {}

  /**
   * Checks if a student with the given email already exists.
   * @param email - The email address to check.
   * @returns A promise that resolves to true if the student exists, false otherwise.
   */
  async isUserExists(email: string): Promise<boolean> {
    const student = await this._studentRepo.findByEmail(email);
    return student ? true : false;
  }

  /**
   * Executes the student registration process.
   * Validates OTP length, retrieves temporary data, verifies OTP, validates data completeness, and saves the new student.
   * @param email - The email address of the student.
   * @param otp - The OTP for verification.
   * @throws HttpError with appropriate status code if registration fails.
   */
  async execute(email: string, otp: string): Promise<void> {
    if (otp.length !== 4) {
      throw new HttpError(
        ERROR_MESSAGES.OTP_INVALID,
        HttpStatusCode.BAD_REQUEST,
      );
    }

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

    // const responseLength = Object.entries(dto).length;
    // if (responseLength !== 3) {
    //   throw new HttpError("Some data's are missing", HttpStatusCode.BAD_REQUEST);
    // }

    // Validate the registration data using Zod schema
    const validationResult = StudentRegistrationSchema.safeParse(dto);
    if (!validationResult.success) {
      throw new HttpError(
        validationResult.error.issues.map((e) => e.message).join(', '),
        HttpStatusCode.BAD_REQUEST,
      );
    }

    const hashedPassword = await bcrypt.hash(
      validationResult.data.password,
      10,
    );

    const student = new Student(
      validationResult.data.fullName,
      validationResult.data.email,
      hashedPassword,
      true, // isEmailVerified
    );

    await this._studentRepo.save(student);
  }
}
