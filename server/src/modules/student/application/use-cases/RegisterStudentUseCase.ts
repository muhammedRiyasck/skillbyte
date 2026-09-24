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
import { IPasswordHasher } from '../../../../shared/services/password-hasher/IPasswordHasher';
import { passwordHasher } from '../../../../shared/services/password-hasher/BcryptPasswordHasher';

/** Executes the business logic for register student. */
export class RegisterStudentUseCase implements IRegisterStudentUseCase {
  constructor(
    private _studentRepo: IStudentRepository,
    private readonly _otpService: IOtpService<
      TempInstructorData | TempStudentData
    >,
    private readonly _passwordHasher: IPasswordHasher = passwordHasher,
  ) {}

  /**
   * Is user exists for the RegisterStudent entity.
   *
   * @param email - The email information.
   * @returns The result of the operation.
   */
  async isUserExists(email: string): Promise<boolean> {
    const student = await this._studentRepo.findByEmail(email);
    return student ? true : false;
  }

  /**
   * Execute for the RegisterStudent entity.
   *
   * @param email - The email information.
   * @param otp - The otp information.
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

    const hashedPassword = await this._passwordHasher.hash(
      validationResult.data.password,
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
