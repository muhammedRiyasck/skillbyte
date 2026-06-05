import { IAdminRepository } from '../../domain/IRepositories/IAdminRepository';
import LoginAdminDTO from '../dtos/LoginAdminDTO';
import bcrypt from 'bcryptjs';
import { generateAccessToken } from '../../../../shared/utils/AccessToken';
import { generateRefreshToken } from '../../../../shared/utils/RefreshToken';
import { ILoginAdminUseCase } from '../interfaces/ILoginAdminUseCase';
import { ERROR_MESSAGES } from '../../../../shared/constants/messages';
import { HttpError } from '../../../../shared/types/HttpError';
import { HttpStatusCode } from '../../../../shared/enums/HttpStatusCodes';
import { UserRole } from '../../../../shared/enums/UserRole';
import { AdminAccountStatus } from '../../../../shared/enums/AdminAccountStatus';
import { LoginAdminResponseDTO } from '../dtos/LoginAdminResponseDTO';

/**
 * Use case for handling admin login.
 */
export class LoginAdminUseCase implements ILoginAdminUseCase {
  /**
   * Constructs the LoginAdminUseCase with the required repository.
   * @param adminRepo - The admin repository interface.
   */
  constructor(private _adminRepo: IAdminRepository) {}

  /**
   * Executes the admin login logic.
   * @param dto - The login data transfer object containing email and password.
   * @returns A promise resolving to the admin entity, access token, and refresh token.
   * @throws Error if credentials are invalid or account is blocked.
   */
  async execute(dto: LoginAdminDTO): Promise<LoginAdminResponseDTO> {
    const admin = await this._adminRepo.findByEmail(dto.email);

    // Use a dummy hash for comparison if admin is not found to prevent timing attacks
    const passwordHash = admin
      ? admin.passwordHash
      : '$2b$10$dummyhashplaceholder';
    const isMatch = await bcrypt.compare(dto.password, passwordHash);

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

    return { admin, accessToken, refreshToken };
  }
}
