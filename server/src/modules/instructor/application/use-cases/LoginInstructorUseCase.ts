
import { generateRefreshToken } from '../../../../shared/utils/RefreshToken';
import { generateAccessToken } from '../../../../shared/utils/AccessToken';
import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { Instructor } from '../../domain/entities/Instructor';
import bcrypt from 'bcryptjs';
import { ILoginInstructorUseCase } from '../interfaces/ILoginInstructorUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';

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
    if (!instructor) {
      throw new HttpError(ERROR_MESSAGES.INVALID_CREDENTIALS, HttpStatusCode.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, instructor.passwordHash);
    if (!isMatch) {
      throw new HttpError(ERROR_MESSAGES.INVALID_CREDENTIALS, HttpStatusCode.UNAUTHORIZED);
    }

    const accountStatus = instructor.accountStatus;

    if (accountStatus === 'pending') {
      throw new HttpError(ERROR_MESSAGES.ACCOUNT_NOT_APPROVED, HttpStatusCode.FORBIDDEN);
    } else if (accountStatus === 'suspended') {
      throw new HttpError(ERROR_MESSAGES.ACCOUNT_SUSPENDED, HttpStatusCode.FORBIDDEN);
    } else if (accountStatus === 'rejected') {
      throw new HttpError(ERROR_MESSAGES.ACCOUNT_REJECTED, HttpStatusCode.FORBIDDEN);
    }
    console.log(instructor.instructorId,'instructor id from login use case')
    const accessToken = generateAccessToken({ id: instructor.instructorId, role: 'instructor' });
    const refreshToken = generateRefreshToken({ id: instructor.instructorId, role: 'instructor' });
    return { user: instructor, accessToken, refreshToken };
  }
}
