import { generateRefreshToken } from '../../../../shared/utils/RefreshToken';
import { generateAccessToken } from '../../../../shared/utils/AccessToken';
import { IInstructorRepository } from '../../domain/IRepositories/IInstructorRepository';
import { InstructorResponseDto } from '../dtos/InstructorResponseDto';
import bcrypt from 'bcryptjs';
import { ILoginInstructorUseCase } from '../interfaces/ILoginInstructorUseCase';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { InstructorAccountStatus } from '../../../../shared/enums/InstructorAccountStatus';
import { UserRole } from '../../../../shared/enums/UserRole';
import { InstructorMapper } from '../mappers/InstructorMapper';

/**
 * Use case for logging in an instructor.
 * Validates credentials, checks account status, and generates tokens upon successful login.
 */
import { LoginRequestDto } from '../../../auth/application/dtos/LoginRequestDto';

export class LoginInstructorUseCase implements ILoginInstructorUseCase {
  constructor(private _instructorRepo: IInstructorRepository) {}

  async execute(dto: LoginRequestDto): Promise<{
    user: InstructorResponseDto;
    accessToken: string;
    refreshToken: string;
  }> {
    const { email, password } = dto;
    if (!password) {
      throw new HttpError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HttpStatusCode.UNAUTHORIZED,
      );
    }
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
    return {
      user: InstructorMapper.toResponseDto(instructor),
      accessToken,
      refreshToken,
    };
  }
}
