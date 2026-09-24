import { generateRefreshToken } from '../../../../shared/utils/RefreshToken';
import { generateAccessToken } from '../../../../shared/utils/AccessToken';
import { IStudentRepository } from '../../domain/IRepositories/IStudentRepository';
import { IPasswordHasher } from '../../../../shared/services/password-hasher/IPasswordHasher';
import { passwordHasher } from '../../../../shared/services/password-hasher/BcryptPasswordHasher';
import { ILoginStudentUseCase } from '../interfaces/ILoginStudentUseCase';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { StudentMapper } from '../mappers/StudentMapper';
import { AuthMapper } from '../../../auth/application/mappers/AuthMapper';
import { AuthResponseDto } from '../../../auth/application/dtos/AuthResponseDto';
import { UserRole } from '../../../../shared/enums/UserRole';

/**
 * Use case for student login.
 * Authenticates student credentials and generates access and refresh tokens.
 */
import { LoginRequestDto } from '../../../auth/application/dtos/LoginRequestDto';

export class LoginStudentUseCase implements ILoginStudentUseCase {
  constructor(
    private _studentRepo: IStudentRepository,
    private _passwordHasher: IPasswordHasher = passwordHasher,
  ) {}

  async execute(dto: LoginRequestDto): Promise<{
    user: AuthResponseDto;
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
    const student = await this._studentRepo.findByEmail(email);
    const passwordHash = student
      ? student.passwordHash
      : '$2b$10$dummyhashplaceholder';
    const isMatch = await this._passwordHasher.compare(password, passwordHash);

    if (!student || !isMatch) {
      throw new HttpError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HttpStatusCode.UNAUTHORIZED,
      );
    }

    const isBlocked = student.accountStatus !== 'active';

    if (isBlocked) {
      throw new HttpError(
        ERROR_MESSAGES.ACCOUNT_BLOCKED,
        HttpStatusCode.FORBIDDEN,
      );
    }

    const accessToken = generateAccessToken({
      id: student.studentId,
      role: 'student',
    });
    const refreshToken = generateRefreshToken({
      id: student.studentId,
      role: 'student',
    });

    const studentDto = StudentMapper.toResponseDto(student);
    return {
      user: AuthMapper.toAuthResponseDto(studentDto, UserRole.STUDENT),
      accessToken,
      refreshToken,
    };
  }
}
