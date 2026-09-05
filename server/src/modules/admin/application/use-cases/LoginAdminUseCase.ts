import { IAdminRepository } from '../../domain/IRepositories/IAdminRepository';
import { LoginAdminRequestDto } from '../dtos/AdminRequestDto';
import { IPasswordHasher } from '../../../../shared/services/password-hasher/IPasswordHasher';
import { passwordHasher } from '../../../../shared/services/password-hasher/BcryptPasswordHasher';
import { generateAccessToken } from '../../../../shared/utils/AccessToken';
import { generateRefreshToken } from '../../../../shared/utils/RefreshToken';
import { ILoginAdminUseCase } from '../interfaces/ILoginAdminUseCase';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { UserRole } from '../../../../shared/enums/UserRole';
import { AdminAccountStatus } from '../../../../shared/enums/AdminAccountStatus';
import { LoginAdminResponseDto } from '../dtos/AdminResponseDto';
import { AdminMapper } from '../mappers/AdminMapper';

/**
 * Use case for handling admin login.
 */
export class LoginAdminUseCase implements ILoginAdminUseCase {
  /**
   * Constructs the LoginAdminUseCase with the required repository.
   * @param adminRepo - The admin repository interface.
   * @param _passwordHasher - Abstraction for password hashing.
   */
  constructor(
    private _adminRepo: IAdminRepository,
    private _passwordHasher: IPasswordHasher = passwordHasher,
  ) {}

  /**
   * Executes the admin login logic.
   * @param dto - The login data transfer object containing email and password.
   * @returns A promise resolving to the admin entity, access token, and refresh token.
   * @throws Error if credentials are invalid or account is blocked.
   */
  async execute(dto: LoginAdminRequestDto): Promise<LoginAdminResponseDto> {
    const admin = await this._adminRepo.findByEmail(dto.email);

    // Use a dummy hash for comparison if admin is not found to prevent timing attacks
    const passwordHash = admin
      ? admin.passwordHash
      : '$2b$10$dummyhashplaceholder';
    const isMatch = await this._passwordHasher.compare(
      dto.password,
      passwordHash,
    );

    if (!admin || !isMatch) {
      throw new HttpError(
        ERROR_MESSAGES.INVALID_CREDENTIALS,
        HttpStatusCode.UNAUTHORIZED,
      );
    }
    const isBlocked = admin.accountStatus === AdminAccountStatus.BLOCKED;
    if (isBlocked) {
      throw new HttpError(
        ERROR_MESSAGES.ACCOUNT_BLOCKED,
        HttpStatusCode.FORBIDDEN,
      );
    }

    const accessToken = generateAccessToken({
      id: admin._id,
      role: UserRole.ADMIN,
    });
    const refreshToken = generateRefreshToken({
      id: admin._id,
      role: UserRole.ADMIN,
    });

    return { admin: AdminMapper.toResponse(admin), accessToken, refreshToken };
  }
}
