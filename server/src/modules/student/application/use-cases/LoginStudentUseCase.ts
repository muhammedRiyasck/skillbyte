
import { generateRefreshToken } from '../../../../shared/utils/RefreshToken';
import { generateAccessToken } from '../../../../shared/utils/AccessToken';
import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { Student } from '../../domain/entities/Student';
import bcrypt from 'bcryptjs';
import { ILoginStudentUseCase } from '../interfaces/ILoginStudentUseCase';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';

/**
 * Use case for student login.
 * Authenticates student credentials and generates access and refresh tokens.
 */
export class LoginStudentUseCase implements ILoginStudentUseCase {
  /**
   * Constructs the LoginStudentUseCase.
   * @param studentRepo - The student repository for data operations.
   */
  constructor(private _studentRepo: IStudentRepository) {}

  /**
   * Executes the student login process.
   * Validates email and password, checks account status, and generates tokens.
   * @param email - The student's email address.
   * @param password - The student's password.
   * @returns A promise that resolves to an object containing the user, access token, and refresh token.
   * @throws HttpError with appropriate status code if login fails.
   */
  async execute(
    email: string,
    password: string,
  ): Promise<{ user: Student; accessToken: string; refreshToken: string }> {
    const student = await this._studentRepo.findByEmail(email);

    if (!student) {
      throw new HttpError(ERROR_MESSAGES.INVALID_CREDENTIALS, HttpStatusCode.UNAUTHORIZED);
    }

    const isMatch = await bcrypt.compare(password, student.passwordHash);
    if (!isMatch) {
      throw new HttpError(ERROR_MESSAGES.INVALID_CREDENTIALS, HttpStatusCode.UNAUTHORIZED);
    }

    const isBlocked = student.accountStatus !== 'active';

    if (isBlocked) {
      throw new HttpError(ERROR_MESSAGES.ACCOUNT_BLOCKED, HttpStatusCode.FORBIDDEN);
    }

    const accessToken = generateAccessToken({ id: student.studentId, role: 'student' });
    const refreshToken = generateRefreshToken({ id: student.studentId, role: 'student' });
    return { user: student, accessToken, refreshToken };
  }
}
