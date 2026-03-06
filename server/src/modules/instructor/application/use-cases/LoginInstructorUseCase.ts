import { generateRefreshToken } from '../../../../shared/utils/RefreshToken';
import { generateAccessToken } from '../../../../shared/utils/AccessToken';
import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { Instructor } from '../../domain/entities/Instructor';
import bcrypt from 'bcryptjs';
import { ILoginInstructorUseCase } from '../interfaces/ILoginInstructorUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { InstructorAccountStatus } from '../../../../shared/enums/InstructorAccountStatus';
import { UserRole } from '../../../../shared/enums/UserRole';

/**
 * Use case for logging in an instructor.
 * Validates credentials, checks account status, and generates tokens upon successful login.
 */
export class LoginInstructorUseCase implements ILoginInstructorUseCase {
  /**
   * Constructs the LoginInstructorUseCase.
   * @param _instructorRepo - The instructor repository for data operations.
   */
  constructor(private _instructorRepo: IInstructorRepository) {}

  /**
   * Executes the instructor login process.
   * Validates email and password, checks account status, and returns user data with tokens.
   * @param email - The instructor's email address.
   * @param password - The instructor's password.
   * @returns A promise that resolves to an object containing the user, access token, and refresh token.
   * @throws HttpError with appropriate status code if login fails.
   */
  async execute(
    email: string,
    password: string,
  ): Promise<{ user: Instructor; accessToken: string; refreshToken: string }> {
    const instructor = await this._instructorRepo.findByEmail(email);

    // Use a dummy hash for comparison if instructor is not found to prevent timing attacks
    const passwordHash = instructor
      ? instructor.passwordHash
      : '$2b$10$dummyhashplaceholder';
    const isMatch = await bcrypt.compare(password, passwordHash);

    if (!instructor || !isMatch) {
      throw new HttpError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    const accountStatus = instructor.accountStatus;

    if (accountStatus === InstructorAccountStatus.PENDING) {
      throw new HttpError(
        ERROR_MESSAGES.ACCOUNT_NOT_APPROVED,
        HttpStatusCode.FORBIDDEN,
      );
    } else if (accountStatus === InstructorAccountStatus.SUSPENDED) {
      throw new HttpError(
        ERROR_MESSAGES.ACCOUNT_SUSPENDED,
        HttpStatusCode.FORBIDDEN,
      );
    }
    const accessToken = generateAccessToken({
      id: instructor.instructorId,
      role: UserRole.INSTRUCTOR,
    });
    const refreshToken = generateRefreshToken({
      id: instructor.instructorId,
      role: UserRole.INSTRUCTOR,
    });
    return { user: instructor, accessToken, refreshToken };
  }
}
